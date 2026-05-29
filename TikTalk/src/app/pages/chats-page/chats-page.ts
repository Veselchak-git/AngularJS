import { ChatSearchService } from './../../data/services/chat-search-service';
import { Component, inject, Input, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, map, Observable, startWith, switchMap } from 'rxjs';
import { ChatInterface } from '../../data/interfaces/chat.interface';
import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { Chat } from '../../data/services/chat-service';
import { ImgUrlPipe } from "../../helpers/pipes/img-url-pipe";
import { getChat } from '../../data/interfaces/get-chat.interface';
import { SvgIcon } from "../../common-ui/svg-icon/svg-icon";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../data/services/profile';
import { toObservable } from '@angular/core/rxjs-interop';
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import { ChatMessageInterface } from '../../data/interfaces/chat-message.interface';

@Component({
  selector: 'app-chats-page',
  imports: [AsyncPipe, ImgUrlPipe, SvgIcon, RouterLink, ReactiveFormsModule, PickerComponent, FormsModule, DatePipe],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.scss',
})
export class ChatsPage {
  @Input() chat!: ChatInterface;
  openedChatSubject = new BehaviorSubject<ChatInterface | null>(null);
  openedChat$ = this.openedChatSubject.asObservable();
  searchControl = new FormControl('');
  chatSearchService = inject(ChatSearchService);
  profileService = inject(ProfileService);
  chatService = inject(Chat);
  route = inject(ActivatedRoute);
  router = inject(Router);
  me$ = toObservable(this.profileService.me);
  chats$ = this.chatService.getChats();
  loading$ = this.chatSearchService.loading$;
  isChatOpened = <boolean>(false);
  messageText = '';
  showPicker = false;
  isMobile = window.innerWidth <= 768;
  showChatList = signal(true);

  constructor() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        // На десктопе показываем оба блока
        this.showChatList.set(true);
      }
    });
  }

  toggleEmojiPicker() {
    this.showPicker = !this.showPicker;
  }

  addEmoji(event: any) {
    this.messageText += event.emoji.native;
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  sendMessage(chatId: number) {
  if (!this.messageText.trim()) return;

  const currentChat = this.openedChatSubject.value;
  if (!currentChat) return;

  this.chatService.sendMessage(chatId, this.messageText).subscribe({
    next: (newMessage) => {
      // Создаём НОВЫЙ объект чата с обновлёнными сообщениями
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, newMessage]
      };
      this.openedChatSubject.next(updatedChat); // новая ссылка → обновление
      this.messageText = "";
      this.showPicker = false;
    },
    error: (err) => console.error('Ошибка отправки', err)
  });
}

  openChat(chatId: number) {
    if (this.isMobile) {
      this.showChatList.set(false);
    }
    this.router.navigate(['/chats', chatId]);
    this.chatService.getPersonalChat(chatId).subscribe(chat => {
        this.openedChatSubject.next(chat);

    })
  }

  closeChat() {
    if (this.isMobile) {
      this.showChatList.set(true);
      this.router.navigate(['/chats']);
    }
    else {
      this.openedChatSubject.next(null);
      this.router.navigate(['/chats'])
    }

  }
}
