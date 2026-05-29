import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import { SvgIcon } from '../../../../common-ui/svg-icon/svg-icon';

@Component({
  selector: 'app-comment-editor',
  imports: [FormsModule, PickerComponent, SvgIcon],
  templateUrl: './comment-editor.html',
  styleUrl: './comment-editor.scss',
})
export class CommentEditor {
  @Input() initialText = '';
  @Output() saveComment = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  text = '';

  ngOnInit() {
    this.text = this.initialText;
  }
  showPicker = false;



  toggleEmojiPicker() {
    this.showPicker = !this.showPicker;
  }

  addEmoji(event: any) {
    this.text += event.emoji.native;
  }

  setText(initial: string) {
    this.text = initial;
  }

  save() {
    if (this.text.trim()) {
      this.saveComment.emit(this.text);
    }
  }

  cancel() {
    this.close.emit();
  }
}


