import { ChatMessageInterface } from "./chat-message.interface"
import { Profile } from "./profile.interface"

export interface ChatInterface {
  id: number,
  userFirst: Profile,
  userSecond: Profile,
  messages: ChatMessageInterface[]
}
