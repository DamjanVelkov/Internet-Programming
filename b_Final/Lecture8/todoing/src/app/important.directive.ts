import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[important]',
  standalone: true
})
export class ImportantDirective implements OnInit, OnChanges {
  @Input() active: boolean = true;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.fontWeight = 'bold';
    this.applyFontSize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['active']) {
      this.applyFontSize();
    }
  }

  private applyFontSize() {
    console.log('ImportantDirective active:', this.active);
    if (this.active) {
      this.el.nativeElement.style.fontSize = '1.5em';
    } else {
      this.el.nativeElement.style.fontSize = '';
    }
  }
}
