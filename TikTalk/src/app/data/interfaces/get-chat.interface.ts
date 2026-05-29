import { Profile } from "./profile.interface";

export interface getChat {
  id: number,
  userFrom: Profile,
  message: string,
  createdAt: string,
  unreadMessages: number
}
