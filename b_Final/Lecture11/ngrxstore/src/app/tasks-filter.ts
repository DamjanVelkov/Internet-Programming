import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { setFilter } from './tasks.actions';
import { Observable } from 'rxjs';
import { selectFilter, selectRemaining } from './tasks.selector';

@Component({
  standalone: true,
  selector: 'app-tasks-filter',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bar">
      <input class="input" [ngModel]="filter$ | async" (ngModelChange)="onFilter($event)" placeholder="Search...">
      <div class="remain">Remaining: <b>{{ (remaining$ | async) ?? 0 }}</b></div>
    </div>
  `,
  styles: [`
    .bar { display: flex; gap: 10px; align-items: center; margin: 8px 0 12px; }
    .input { flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; }
    .remain { color: #444; }
  `]
})
export class TasksFilterComponent {
  remaining$: Observable<number> = this.store.select(selectRemaining);
  filter$:    Observable<string> = this.store.select(selectFilter);

  constructor(private store: Store) {}

  onFilter(text: string) {
    this.store.dispatch(setFilter({ text }));
  }
}
