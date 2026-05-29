import { Component, Input } from '@angular/core';
import { Post } from "../post/post";
import { PostInput } from "../post-input/post-input";

@Component({
  selector: 'app-post-feed',
  imports: [Post, PostInput],
  standalone: true,
  templateUrl: './post-feed.html',
  styleUrl: './post-feed.scss',
})
export class PostFeed {

}
