import { Component, signal } from '@angular/core';
import { Dnd } from "../../../common-ui/directives/dnd";

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [Dnd],
  templateUrl: './avatar-upload.html',
  styleUrl: './avatar-upload.scss',
})
export class AvatarUpload {
  preview = signal<string>('/assets/images/avatar-placeholder.png');
  avatar: File | null = null;

  fileBrowserHandler(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.proccessFile(file);
  }

  onFileDropped(file: File) {
    this.proccessFile(file);
  }

  proccessFile(file: File | null | undefined) {
    if (!file || !file.type.match('image')) return

    const reader = new FileReader();

    reader.onload = event => {
      this.preview.set(event.target?.result?.toString() ?? '')
    }

    reader.readAsDataURL(file);
    this.avatar = file;
  }
}
