import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Pageble } from '../interfaces/pageble.interface';
import { Post } from '../interfaces/post.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  http = inject(HttpClient);
  baseApiUrl = 'https://icherniakov.ru/yt-course/';
  me = signal<Profile | null>(null);
  filteredProfiles = signal<Profile[]>([]);
  private subscriptionsCache: Profile[] | null = null;
  private subscriptionsSubject = new BehaviorSubject<Profile[]>([]);
  public subscriptions$ = this.subscriptionsSubject.asObservable();

  getTestAccounts() {
    return this.http.get<Profile[]>(`${this.baseApiUrl}account/test_accounts`);
  }

  getMe() {
    return this.http.get<Profile>(`${this.baseApiUrl}account/me`)
    .pipe(
      tap(res => this.me.set(res))
    )
  }

  getAccount(id: string) {
    return this.http.get<Profile>(`${this.baseApiUrl}account/${id}`)
  }

  getSubscribersShortList(subsAmount = 3) {
    return this.http.get<Pageble<Profile>>(`${this.baseApiUrl}account/subscribers/`)
    .pipe(
      map(res => res.items.slice(0, subsAmount)),
    )
  }

  patchProfile(profile: Partial<Profile>) {
    return this.http.patch<Profile>(
      `${this.baseApiUrl}account/me`, profile)
  }

  uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<Profile>(
      `${this.baseApiUrl}account/upload_image`, fd)

  }

  filterProfiles(params: Record<string, any>) {
    return this.http.get<Pageble<Profile>>(
      `${this.baseApiUrl}account/accounts`, {params})
      .pipe(
        tap(res => this.filteredProfiles.set(res.items))
    )
  }

  subscribeToUser(userId: number) {
    return this.http.post<Profile>(`${this.baseApiUrl}account/subscribe/${userId}`, {})
  }

  unsubscribeFromUser(userId: number) {
    return this.http.delete(`${this.baseApiUrl}account/subscribe/${userId}`);
  }

  getSubscriptions() {
     return this.http.get<Pageble<Profile>>(`${this.baseApiUrl}account/subscriptions/`)
  }

  getSubscriptionsById(userId: number) {
     return this.http.get<Pageble<Profile>>(`${this.baseApiUrl}account/subscriptions/${userId}`)
  }

  loadSubscriptions(): void {
    // Если уже есть в кеше, не загружаем
    if (this.subscriptionsCache) {
      this.subscriptionsSubject.next(this.subscriptionsCache);
      return;
    }

    // Загружаем один раз
    this.getSubscriptions().subscribe({
      next: (response) => {
        this.subscriptionsCache = response.items; // Берём только массив
        this.subscriptionsSubject.next(this.subscriptionsCache);
      },
      error: (err) => {
        console.error('Ошибка загрузки подписок', err);
      }
    });
  }

  // Обновить кеш после подписки/отписки
  refreshSubscriptions(): void {
    this.getSubscriptions().subscribe({
      next: (response) => {
        this.subscriptionsCache = response.items;
        this.subscriptionsSubject.next(this.subscriptionsCache);
      },
      error: (err) => console.error('Ошибка обновления подписок', err)
    });
  }
}
