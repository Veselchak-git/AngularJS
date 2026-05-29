import { firstValueFrom, switchMap, tap } from 'rxjs';
import { Post as PostModel} from './../../../data/interfaces/post.interface';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import { PostService } from '../../../data/services/post-service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ImgUrlPipe } from "../../../helpers/pipes/img-url-pipe";
import { SvgIcon } from '../../../common-ui/svg-icon/svg-icon';
import { ProfileService } from '../../../data/services/profile';
import { toObservable } from '@angular/core/rxjs-interop';
import { PostEditor } from '../tools/post-editor/post-editor';
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import { FormsModule } from '@angular/forms';
import { CommentInterface } from '../../../data/interfaces/comment.interface';
import { CommentEditor } from "../tools/comment-editor/comment-editor";

@Component({
  selector: 'app-post',
  imports: [AsyncPipe, DatePipe, ImgUrlPipe, SvgIcon, PostEditor, PickerComponent, FormsModule, CommentEditor],
  standalone: true,
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class Post {
  @Input() post?: PostModel | null = null;
  selectedPost?: PostModel | null = null;
  postService = inject(PostService);
  route = inject(ActivatedRoute);
  profileService = inject(ProfileService);
  me$ = toObservable(this.profileService.me);
  posts$ = this.postService.getPosts();
  subPosts$ = this.postService.getSubscriptionPosts();
  postMenuMap = new Map<number, boolean>();
  commentsMenuMap = new Map<number, boolean>();
  commentsMap = new Map<number, CommentInterface[]>();
  isCurrentUser: boolean = false;
  isLiked!: boolean;
  postText = '';
  commentText: {[key: number]: string} = {};
  commentPickerStates: { [key: number]: boolean } = {};
  postPickerOpen = false;
  showEditModal = false;
  showCommentEditor = false;
  editingCommentId: number | null = null;
  editingCommentOldText = '';
  isCurrentUserId =  firstValueFrom(this.profileService.getMe());
  posts: PostModel[] = [];

  ngOnInit() {
    this.posts$.subscribe(posts => {
      this.posts = posts;
    });
  }

  profiles$ = this.route.params
    .pipe(
      switchMap(({id}) => {
        if (id === 'me') {
          this.isCurrentUser = true;
          return this.me$
        }
        this.isCurrentUser = false;
        return this.profileService.getAccount(id);
      })
    );

  editPost(post: PostModel) {
    this.selectedPost = post;
    this.showEditModal = true;
  }

  onEditModalClose(event: { action: string; content?: string }) {
    if (event.action === 'save' && event.content && this.selectedPost) {
      const updateData = { content: event.content };
      // Оптимистичное обновление (меняем текст сразу)
      const previousContent = this.selectedPost.content;
      this.selectedPost.content = event.content;
      this.postService.updatePost(this.selectedPost.id, updateData).subscribe({
        next: () => {
          // После успеха перезагружаем список, чтобы синхронизировать
          this.posts$ = this.postService.getPosts();
          this.closeEditModal();
        },
        error: (error) => {
          // Откат при ошибке
          if (this.selectedPost) {
            this.selectedPost.content = previousContent;
          }
          console.error('Ошибка при редактировании', error);
          this.closeEditModal();
        }
      });
      this.closeEditModal();
    } else {
      this.closeEditModal();
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedPost = null;
  }

  deletePost(postId: number) {
    this.postService.deletePost(postId).subscribe({
      next: () => {window.location.reload()}
    });
  }

  togglePostSettingsMenu(event: Event, postId: number) {
    event.stopPropagation();
    const current = this.postMenuMap.get(postId) || false;
    this.postMenuMap.set(postId, !current);
  }
  toggleCommentSettingsMenu(event: Event, commentId: number) {
    event.stopPropagation();
    const current = this.commentsMenuMap.get(commentId) || false;
    this.commentsMenuMap.set(commentId, !current);
  }

  toggleCommentsMenu(event: Event, postId: number) {
    event.stopPropagation();
    const current = this.commentsMenuMap.get(postId) || false;
    this.commentsMenuMap.set(postId, !current);
  }


  isPostMenuOpen(postId: number): boolean {
    return this.postMenuMap.get(postId) || false;
  }

  isCommentsMenuOpen(postId: number): boolean {
    return this.commentsMenuMap.get(postId) || false;
  }

  toggleLike(post: PostModel, profileId: number) {
      if (post.likesUsers.includes(profileId.toString())) {
        this.isLiked = true
      }
      else {
        this.isLiked = false;
      }

      if (this.isLiked) {
        post.likesUsers = post.likesUsers.filter(id => id !== post.author.id.toString());
      } else {
        post.likesUsers = [...post.likesUsers, post.author.id.toString()];
      }
      if (post.likes !== undefined) {
              post.likes = post.likesUsers.length;
            }
      const request$ = this.isLiked
        ? this.postService.unlikePost(post.id)
        : this.postService.likePost(post.id);


      request$.subscribe({
        next: (response) => {
          if (response?.likesUsers) {
            post.likesUsers = response.likesUsers;
            if (post.likes !== undefined) {
              post.likes = post.likesUsers.length;
            }
          }
        },
        error: (error) => {
          this.isLiked = true;
          post.likes += this.isLiked ? 1 : -1;
          console.error('Ошибка при изменении лайка', error);
        }
      });
  }

  addEmojiToPost(event: any) {
    this.postText += event.emoji.native;
  }

  addEmojiToComment(event: any, postId: number) {
    this.commentText[postId] += event.emoji.native;
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  togglePostPicker() {
    this.postPickerOpen = !this.postPickerOpen;
  }

  toggleCommentPicker(postId: number) {
    this.commentPickerStates[postId] = !this.commentPickerStates[postId];
  }

  sendComment(postId:number) {
    const commText = this.commentText[postId];
    if (!commText.trim()) return;
    const newComment = {
      text: commText,
      postId: postId,
    }
    this.postService.createComment(newComment).subscribe({
      next: (createdComment) => {
        // Добавляем новый комментарий в локальный Map
        const currentComments = this.commentsMap.get(postId) || [];
        this.commentsMap.set(postId, [createdComment, ...currentComments]);
        delete this.commentText[postId];
        delete this.commentPickerStates[postId];
        window.location.reload();
      },
      error: (err) => {
        console.error('Ошибка отправки комментария', err);
      }
    });
  }
  deleteComment(postId: number, commentId: number) {
    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments = post.comments.filter(c => c.id !== commentId);
        }
        this.commentsMenuMap.delete(commentId);
        window.location.reload();
      },
      error: (err) => console.error('Ошибка удаления комментария', err)
    });
  }

  openCommentEditor(commentId: number, currentText: string) {
    this.editingCommentId = commentId;
    this.editingCommentOldText = currentText;
    this.showCommentEditor = true;
  }

  // Закрыть редактор
  closeCommentEditor() {
    this.showCommentEditor = false;
    this.editingCommentId = null;
  }

  onCommentSaved(newText: string, post: PostModel) {
    if (!this.editingCommentId) return;

    // Находим комментарий в локальных данных
    let targetComment: any = null;
    let targetPost: any = null;
    for (const post of this.posts) {
      const comment = post.comments.find((c: any) => c.id === this.editingCommentId);
      if (comment) {
        targetComment = comment;
        targetPost = post;
        break;
      }
    }

    if (!targetComment) {
      this.closeCommentEditor();
      return;
    }

    // Оптимистичное обновление (меняем текст сразу)
    const oldText = targetComment.text;
    targetComment.text = newText;
    // Триггерим change detection – создаём новый массив
    post.comments = [...targetPost.comments];

    // Отправляем на сервер
    this.postService.updateComment(this.editingCommentId, { text: newText }).subscribe({
      error: (err) => {
        console.error(err);
        // Откат при ошибке
        targetComment.text = oldText;
        targetPost.comments = [...targetPost.comments];
      }
    });

    this.closeCommentEditor();
  }
}
