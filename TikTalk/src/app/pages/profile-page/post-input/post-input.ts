import { PostService } from './../../../data/services/post-service';
import { Component, inject, input} from '@angular/core';
import { ImgUrlPipe } from "../../../helpers/pipes/img-url-pipe";
import { Profile } from '../../../data/interfaces/profile.interface';
import { ActivatedRoute } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { ProfileService } from '../../../data/services/profile';
import { firstValueFrom, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { SvgIcon } from "../../../common-ui/svg-icon/svg-icon";
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-input',
  imports: [ImgUrlPipe, AsyncPipe, SvgIcon, PickerComponent, FormsModule],
  standalone: true,
  templateUrl: './post-input.html',
  styleUrl: './post-input.scss',
})
export class PostInput {
  profile = input<Profile>()
  profileService = inject(ProfileService);
  postService = inject(PostService);
  route = inject(ActivatedRoute);
  me$ = toObservable(this.profileService.me);
  subscribers$ = this.profileService.getSubscribersShortList(5);
  postText = '';
  showPicker = false;
  isCurrentUser: boolean = false;
  isCurrentUserId =  firstValueFrom(this.profileService.getMe());


  profile$ = this.route.params
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

  toggleEmojiPicker() {
    this.showPicker = !this.showPicker;
  }

  addEmoji(event: any) {
    this.postText += event.emoji.native;
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  sendPost() {
    if (!this.postText.trim()) return;
    const newPost = {
      content: this.postText
    };
    this.postService.createPost(newPost).subscribe({
      next: () => {window.location.reload()}
    });
    this.postText = "";
    this.showPicker = false;
  }
}

