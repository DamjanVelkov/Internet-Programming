import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Group } from '../group.model';
import { GroupsService } from '../groups';


@Component({
  standalone: true,
  selector: 'app-groups-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1>Groups</h1>

      <form #f="ngForm" (ngSubmit)="onAdd(f)" class="card">
        <div class="row">
          <label>Name *</label>
          <input name="name" [(ngModel)]="draft.name" 
          required minlength="3" #name="ngModel" />
          <div class="err" *ngIf="name.invalid && (name.dirty || name.touched)">
            <span *ngIf="name.errors?.['required']">Name is required.</span>
            <span *ngIf="name.errors?.['minlength']">Min length is 3.</span>
          </div>
        </div>

        <div class="row">
          <label>Members (comma separated)</label>
          <input name="members" [(ngModel)]="draft.membersCsv" placeholder="e.g. Ana,Boris,Chris" />
        </div>

        <div class="row">
          <label>Description</label>
          <textarea name="description" [(ngModel)]="draft.description"></textarea>
        </div>

        <button type="submit" [disabled]="f.invalid">Add Group</button>
      </form>

      <input class="search" [(ngModel)]="q" placeholder="Search by name" />

      <ul class="list">
        <li *ngFor="let g of groups"
            [hidden]="q && !matches(g, q)"
            (click)="open(g.id)">
          <div class="name">{{ g.name }}</div>
          <div class="meta">{{ g.members.length }} members</div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .page { max-width: 820px; margin: 16px auto; padding: 0 12px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 8px 0 16px; }
    .row { display: grid; gap: 6px; margin-bottom: 10px; }
    .err { color: #b00020; font-size: 12px; }
    .search { width: 100%; padding: 8px 10px; margin: 8px 0 14px; }
    .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .list li { border: 1px solid #ddd; padding: 10px 12px; border-radius: 8px; cursor: pointer; }
    .list li:hover { background: #fafafa; }
    .name { font-weight: 600; }
    .meta { color: #666; font-size: 13px; margin-top: 2px; }
  `]
})
export class GroupsListComponent {
  q = '';
  groups: Group[] = [];
  draft = { name: '', membersCsv: '', description: '' };

  constructor(private svc: GroupsService, private router: Router) {
    this.svc.getAll().subscribe(xs => this.groups = xs.slice());
  }

  matches(g: Group, q: string): boolean {
    const needle = q.trim().toLowerCase();
    return g.name.toLowerCase().includes(needle);
  }

  onAdd(form: NgForm) {
    if (form.invalid) return;
    const nextId = (this.groups.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
    const members = (this.draft.membersCsv || '')
      .split(',').map(s => s.trim()).filter(Boolean);

    const g: Group = {
      id: nextId,
      name: this.draft.name.trim(),
      members,
      description: this.draft.description.trim() || undefined
    };

    this.groups = [g, ...this.groups];
    form.resetForm({ name: '', membersCsv: '', description: '' });
  }

  open(id: number) {
    const g = this.groups.find(x => x.id === id);
    this.router.navigate(['/groups', id], { state: { group: g } }); // pass object for new items
  }
}
