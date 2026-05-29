import { Profile } from './profile.interface';
export interface CommentInterface {
  id: number,
  text: string,
  author: Profile,
  postId: number,
  commentId: number,
  createdAt: string,
  updatedAt: string
}
