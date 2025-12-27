import { NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ListEpisode } from "./models/view-models";

@Component({
    selector: 'app-episodes-list',
    standalone: true,
    imports: [NgFor, NgIf],
    template: `
    <table class="grid">
      <thead>
        <tr>
          <th (click)="toggleSort('rank')">
            Rank <span class="muted">{{ sort?.by==='rank' ? '('+sort?.dir+')' : '' }}</span>
          </th>
          <th (click)="toggleSort('title')">
            Title <span class="muted">{{ sort?.by==='title' ? '('+sort?.dir+')' : '' }}</span>
          </th>
          <th>Era</th>
          <th class="nowrap">Year</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let e of episodes" (click)="select.emit(e.rank)" [class.selected]="e.rank===selectedRank">
          <td>{{ e.rank }}</td>
          <td>{{ e.title }}</td>
          <td>{{ e.era }}</td>
          <td class="nowrap">{{ e.year }}</td>
        </tr>
        <tr *ngIf="episodes.length === 0">
          <td colspan="4" class="muted">No episodes match the filter criteria.</td>
        </tr>
      </tbody>
    </table>
  `,
    styles: [`
    :host { display:block; }
    .grid { width:100%; border-collapse: collapse; table-layout: fixed; }
    thead th { position: sticky; top: -12px; background:#fafafa; z-index:1; }
    th, td { padding: 10px 12px; border-bottom:1px solid #eee; text-align:left; }
    th { cursor:pointer; user-select:none; font-weight:600; }
    tr:hover { background:#f8fafc; }
    tr.selected { background:#eef2ff; }
    .muted { color:#667085; font-weight: normal; }
    .nowrap { white-space: nowrap; }
    td, th { overflow:hidden; text-overflow:ellipsis; }
  `]
})
export class ListComponent {
    @Input()
    episodes: ListEpisode[] = [];

    
    selectedRank: number | null = null;
    sort: { by: 'rank' | 'title'; dir: 'asc' | 'desc' } | null = null;

    toggleSort(by: 'rank' | 'title') {
        if (this.sort?.by === by) {
            this.sort.dir = this.sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sort = { by, dir: 'asc' };
        }
        this.applySort();
    }

    applySort() {
        if (!this.sort) return;
        this.episodes.sort((a, b) => {
            let comp = 0;
            if (this.sort!.by === 'rank') {
                comp = a.rank - b.rank;
            } else if (this.sort!.by === 'title') {
                comp = a.title.localeCompare(b.title);
            }
            return this.sort!.dir === 'asc' ? comp : -comp;
        });
    }

    @Output()
    select: EventEmitter<number> = new EventEmitter<number>();
}