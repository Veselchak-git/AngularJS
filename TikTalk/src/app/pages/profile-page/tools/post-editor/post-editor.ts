import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Post as PostModel } from '../../../../data/interfaces/post.interface';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { SvgIcon } from '../../../../common-ui/svg-icon/svg-icon';

@Component({
  selector: 'app-post-editor',
  imports: [FormsModule, PickerComponent, SvgIcon],
  standalone: true,
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.scss',
})
export class PostEditor {
  @Input() editpost?: PostModel | null = null;
  @Output() close = new EventEmitter<{ action: 'save', content: string } | { action: 'cancel' }>();

  editContent: string = "";
  showPicker = false;

  toggleEmojiPicker() {
    this.showPicker = !this.showPicker;
  }

  addEmoji(event: any) {
    this.editContent += event.emoji.native;
  }

  ngOnChanges() {
    if (this.editpost) {
      this.editContent = this.editpost.content;
    }
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  save() {
    if (this.editContent.trim()) {
      this.close.emit({ action: 'save', content: this.editContent });
    }
  }

  cancel() {
    this.close.emit({ action: 'cancel' });
  }
}
