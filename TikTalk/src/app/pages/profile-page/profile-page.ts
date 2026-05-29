import { ProfileService } from './../../data/services/profile';
import { Component, inject, Pipe } from '@angular/core';
import { ProfileHeader } from "../../common-ui/profile-header/profile-header";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { SubscriberCard } from "../../common-ui/sidebar/subscriber-card/subscriber-card";
import { ImgUrlPipe } from "../../helpers/pipes/img-url-pipe";
import { PostFeed } from "./post-feed/post-feed";
import { SvgIcon } from "../../common-ui/svg-icon/svg-icon";
import { PostInput } from "./post-input/post-input";

@Component({
  selector: 'app-profile-page',
  imports: [ProfileHeader, AsyncPipe, RouterLink, ImgUrlPipe, PostFeed, SvgIcon],
  standalone: true,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  profileService = inject(ProfileService);
  route = inject(ActivatedRoute);
  me$ = toObservable(this.profileService.me);
  subscribers$ = this.profileService.getSubscribersShortList(5);
  isCurrentUser: boolean = false;
  showDetails = false;

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

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
