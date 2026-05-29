import { Component, Input } from '@angular/core';
import { Profile } from '../../../data/interfaces/profile.interface';
import { ImgUrlPipe } from "../../../helpers/pipes/img-url-pipe";

@Component({
  selector: 'app-subscriber-card',
  imports: [ImgUrlPipe],
  standalone: true,
  templateUrl: './subscriber-card.html',
  styleUrl: './subscriber-card.scss',
})
export class SubscriberCard {
  @Input() profile!: Profile;
}
