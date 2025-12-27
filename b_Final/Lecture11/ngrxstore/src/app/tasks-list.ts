import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Task } from './task.model';
import { removeTask, toggleTask, clearCompleted } from './tasks.actions';
import { selectVisible } from './tasks.selector';

@Component({
  standalone: true,
  selector: 'app-tasks-list',
  imports: [CommonModule],
  template: `
    <div class="actions">
      <button class="btn muted" (click)="onClearCompleted()">Clear completed</button>
    </div>

    <table class="tbl" *ngIf="(items$ | async) as items; else empty">
      <thead>
        <tr><th>Title</th><th>Status</th><th style="width:120px">Actions</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of items">
          <td>
            <span [class.done]="t.done">{{ t.title }}</span>
          </td>
          <td>{{ t.done ? 'Done' : 'Active' }}</td>
          <td class="act">
            <button class="btn" (click)="onToggle(t.id)">{{ t.done ? 'Undo' : 'Toggle' }}</button>
            <button class="btn danger" (click)="onRemove(t.id)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ng-template #empty>
      <div class="empty">No tasks match your filter.</div>
    </ng-template>
  `,
  styles: [`
    .actions { display:flex; justify-content:flex-end; margin: 8px 0; }
    .tbl { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #eee; }
    .act { display:flex; gap:6px; }
    .btn { padding: 6px 10px; border: 1px solid #bbb; background:#f8f8f8; border-radius:8px; }
    .btn.danger { border-color:#e05; background:#ffe7ee; }
    .btn.muted { border-color:#ccc; background:#fafafa; }
    .done { text-decoration: line-through; color:#777; }
    .empty { padding: 10px; border:1px dashed #ccc; border-radius:8px; color:#555; }
  `]
})
export class TasksListComponent {
  items$: Observable<Task[]> = this.store.select(selectVisible);

  constructor(private store: Store) {}

  onToggle(id: number) { this.store.dispatch(toggleTask({ id })); }
  onRemove(id: number) { this.store.dispatch(removeTask({ id })); }
  onClearCompleted()   { this.store.dispatch(clearCompleted()); }
}
