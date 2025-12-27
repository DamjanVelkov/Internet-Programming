import { Component } from '@angular/core';
import { TaskAddComponent } from './task-add';
import { TasksFilterComponent } from './tasks-filter';
import { TasksListComponent } from './tasks-list';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [TaskAddComponent, TasksFilterComponent, TasksListComponent],
  template: `
    <div class="page">
      <h1>Lecture 11 — NgRx Store</h1>
      <app-task-add></app-task-add>
      <app-tasks-filter></app-tasks-filter>
      <app-tasks-list></app-tasks-list>
    </div>
  `,
  styles: [`
    .page { max-width: 860px; margin: 18px auto; padding: 0 12px; 
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    h1 { font-size: 22px; margin: 8px 0 14px; }
  `]
})
export class AppComponent {}
