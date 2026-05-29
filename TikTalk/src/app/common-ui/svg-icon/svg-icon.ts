import { Component, Input, ElementRef} from '@angular/core';

@Component({
  selector: 'svg[icon]',
  standalone: true,
  imports: [],
  template: '<svg:use [attr.href]="href"></svg:use>',
  styles: ['']
})
export class SvgIcon {
  @Input() icon= '';

  constructor(private elementRef: ElementRef<SVGElement>) {}

  ngOnInit() {
    const svg = this.elementRef.nativeElement;
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.href);
    svg.appendChild(use);
  }

  get href() {
    return `/assets/svg/${this.icon}.svg#${this.icon}`;
  }
}
