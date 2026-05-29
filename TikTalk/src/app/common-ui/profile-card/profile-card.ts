import { ProfileService } from './../../data/services/profile';
import { Profile } from './../../data/interfaces/profile.interface';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ImgUrlPipe } from '../../helpers/pipes/img-url-pipe';
import { SvgIcon } from "../svg-icon/svg-icon";
import {Router } from '@angular/router';
import { Chat } from '../../data/services/chat-service';
@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [ImgUrlPipe, SvgIcon],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
})
export class ProfileCard {
  @Input() profile!: Profile;
  @Input() isCurrentUser = false;
  @Input() isSubscribed = false;
  @Output() subscriptionChanged = new EventEmitter<{ profileId: number; isSubscribed: boolean }>();
  profileService = inject(ProfileService);
  chatService = inject(Chat);
  router = inject(Router);

  isSubscribing = false;

  toggleSubscription() {
    if (this.isSubscribing) return;

    this.isSubscribing = true;
    const oldState = this.isSubscribed;
    this.isSubscribed = !this.isSubscribed;
    this.subscriptionChanged.emit({
      profileId: this.profile.id,
      isSubscribed: this.isSubscribed
    });

    const request$ = this.isSubscribed
      ? this.profileService.subscribeToUser(this.profile.id)
      : this.profileService.unsubscribeFromUser(this.profile.id);

    request$.subscribe({
      next: () => {
        this.profileService.refreshSubscriptions();
        this.isSubscribing = false;
      },
      error: (err) => {
        console.error('Ошибка', err);
        this.isSubscribed = oldState;
        this.subscriptionChanged.emit({
          profileId: this.profile.id,
          isSubscribed: this.isSubscribed
        });
        this.isSubscribing = false;
      }
    });
  }

  goToProfile(profileId: number): void {
    this.router.navigate(['/profile', profileId]);
  }

  createChat(profile: Profile) {
    this.chatService.createPersonalChat(profile.id).subscribe({
      next: (chat) => {
        this.router.navigate(['/chats', chat.id])
      }
    });

  }
}
