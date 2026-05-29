import { Component, inject, signal } from '@angular/core';
import { ProfileCard } from '../../common-ui/profile-card/profile-card';
import { ProfileService } from '../../data/services/profile';
import { ProfileFilters } from "./profile-filters/profile-filters";
import { Profile } from '../../data/interfaces/profile.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-page',
  imports: [ProfileCard, ProfileFilters],
  standalone: true,
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  protected readonly title = signal('AngularApp');
  profileService = inject(ProfileService);
  profiles = this.profileService.filteredProfiles
  subscriptions: Profile[] = [];
  private subscriptionsSub!: Subscription;

  ngOnInit() {
    this.profileService.loadSubscriptions();
    this.subscriptionsSub = this.profileService.subscriptions$.subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions;
      },
      error: (err) => console.error('Ошибка получения подписок', err)
    });
  }

  ngOnDestroy() {
    if (this.subscriptionsSub) {
      this.subscriptionsSub.unsubscribe();
    }
  }

  isSubscribed(profileId: number): boolean {
    return this.subscriptions.some(sub => sub.id === profileId);
  }

  onSubscriptionChanged(event: { profileId: number; isSubscribed: boolean }) {
    if (event.isSubscribed) {
      // Добавляем профиль в подписки
      const profile = this.profiles().find(p => p.id === event.profileId);
      if (profile && !this.subscriptions.some(s => s.id === event.profileId)) {
        this.subscriptions = [...this.subscriptions, profile];
      }
    } else {
      // Удаляем из подписок
      this.subscriptions = this.subscriptions.filter(s => s.id !== event.profileId);
    }
  }
}
