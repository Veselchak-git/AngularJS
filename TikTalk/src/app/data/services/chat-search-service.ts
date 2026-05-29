import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ChatInterface } from '../interfaces/chat.interface';
import { Chat } from './chat-service';
import { Profile } from '../interfaces/profile.interface';
import { getChat } from '../interfaces/get-chat.interface';
@Injectable({
  providedIn: 'root'
})
export class ChatSearchService {
  chatsSubject = new BehaviorSubject<getChat[]>([]);
  chats$ = this.chatsSubject.asObservable();
  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  chatService = inject(Chat);


  searchChatsByName(chats: getChat[], query: string): getChat[] {
    if (!query || query.trim().length === 0) {
      return [...chats];
    }

    const normalizedQuery = query.trim().toLowerCase();

    const scored = chats
      .map(chat => ({
        chat,
        score: this.getProfileScore(chat.userFrom, normalizedQuery)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.chat);

    return scored;
  }

  private getProfileScore(profile: Profile, query: string): number {
    const firstName = profile.firstName?.toLowerCase() || '';
    const lastName = profile.lastName?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName === query) return 100;
    if (firstName === query || lastName === query) return 80;
    if (firstName.startsWith(query) || lastName.startsWith(query)) return 60;
    if (firstName.includes(query) || lastName.includes(query)) return 40;
    if (fullName.includes(query)) return 30;
    return 0;
  }

  loadChats(): Observable<getChat[]> {
    this.loadingSubject.next(true);
    return this.chatService.getChats().pipe(
      tap(chats => {
        this.chatsSubject.next(chats);
        this.loadingSubject.next(false);
      }),
      catchError(err => {
        this.loadingSubject.next(false);
        return throwError(() => err);
      })
    );
  }

  searchChats(query: string): getChat[] {
    const chats = this.chatsSubject.value;
    return this.searchChatsByName(chats, query);
  }
}
