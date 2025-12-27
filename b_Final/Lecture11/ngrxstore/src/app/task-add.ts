import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { addTask } from './tasks.actions';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <form class="row" (ngSubmit)="onAdd()">
      <input class="input" [(ngModel)]="title" name="title" placeholder="New task..." required minlength="3">
      <button class="btn" type="submit" [disabled]="!title || title.trim().length < 3">Add</button>
    </form>
  `,
  styles: [`
    .row { display: flex; gap: 8px; margin: 8px 0 12px; }
    .input { flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; }
    .btn { padding: 8px 12px; border: 1px solid #0b64d8; background: #0b64d8; color: #fff; border-radius: 8px; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
  `]
})
export class TaskAddComponent {
  title = '';

  constructor(private store: Store) {}

  onAdd() {
    const t = this.title.trim();
    if(t.length >= 3) {
      this.store.dispatch(addTask({ title: t }))
    }
  }
}
