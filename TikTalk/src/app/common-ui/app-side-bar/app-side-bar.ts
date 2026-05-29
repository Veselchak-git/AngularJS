import { ProfileService } from './../../data/services/profile';
import { Component, inject, signal } from '@angular/core';
import { SvgIcon } from "../svg-icon/svg-icon";
import { SubscriberCard } from "../sidebar/subscriber-card/subscriber-card";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AsyncPipe, JsonPipe} from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ImgUrlPipe } from "../../helpers/pipes/img-url-pipe";
import { AuthService } from '../../data/services/auth-service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [SvgIcon, SubscriberCard, RouterLink, AsyncPipe, ImgUrlPipe, RouterLinkActive],
  templateUrl: './app-side-bar.html',
  styleUrl: './app-side-bar.scss',
})
export class AppSideBar {
  profileService = inject(ProfileService);
  showMenu = signal(false);
  router = inject(Router);
  auth = inject(AuthService);
  isMobileMenuOpen = signal(false);

  subscribers$ = this.profileService.getSubscribersShortList();

  me = this.profileService.me

  menuItems = [
    {
      label: 'Моя страница',
      icon: 'home',
      link: 'profile/me'
    },
    {
      label: 'Чаты',
      icon: 'chats',
      link: 'chats'
    },
    {
      label: 'Поиск',
      icon: 'search',
      link: 'search'
    }
  ]


  ngOnInit() {
    firstValueFrom(this.profileService.getMe())
  }

  toggleSettingsMenu(event: Event) {
    event.stopPropagation();
    this.showMenu.set(!this.showMenu());
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
    this.closeMenu();
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
  }
}

