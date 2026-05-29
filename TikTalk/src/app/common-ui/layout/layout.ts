import { ProfileService } from './../../data/services/profile';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSideBar } from '../app-side-bar/app-side-bar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, AppSideBar],
  standalone: true,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
}
