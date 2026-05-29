import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatInterface } from '../interfaces/chat.interface';
import { ChatMessageInterface } from '../interfaces/chat-message.interface';
import { getChat } from '../interfaces/get-chat.interface';

@Injectable({
  providedIn: 'root'
})
export class Chat {
  http = inject(HttpClient);
  baseApiUrl = 'https://icherniakov.ru/yt-course/';

  createPersonalChat(userId: number) {
    return this.http.post<ChatInterface>(`${this.baseApiUrl}chat/${userId}`, {});
  }

  getPersonalChat(chatId: number) {
    return this.http.get<ChatInterface>(`${this.baseApiUrl}chat/${chatId}`);
  }

  getChats(): Observable<getChat[]> {
    return this.http.get<getChat[]>(`${this.baseApiUrl}chat/get_my_chats/`);
  }

  sendMessage(chatId: number, message: string) {
    return this.http.post<ChatMessageInterface>(`${this.baseApiUrl}message/send/${chatId}?message=${message}`,{});
  }

  getMyMessage(messageId: number) {
    return this.http.get<ChatMessageInterface>(`${this.baseApiUrl}message/${messageId}`);
  }

  editMyMessage(messageId: number, text: string) {
    return this.http.patch<ChatMessageInterface>(`${this.baseApiUrl}message/${messageId}`, text);
  }

  deleteMyMessage(messageId: number) {
    return this.http.delete(`${this.baseApiUrl}message/${messageId}`);
  }
}
