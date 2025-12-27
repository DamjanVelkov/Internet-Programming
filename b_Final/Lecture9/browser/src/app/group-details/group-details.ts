import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupsService } from '../groups';
import { Group } from '../group.model';


@Component({
  standalone: true,
  selector: 'app-group-details',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <a routerLink="/" class="back">← Back</a>
      <h2 class="title">{{ group?.name || 'Details' }}</h2>

      <ng-container *ngIf="group as g; else missing">
        <div class="section">
          <div class="label">Members</div>
          <ul class="members">
            <li *ngFor="let m of g.members">{{ m }}</li>
          </ul>
        </div>

        <div class="section" *ngIf="g.description as desc">
          <div class="label">Description</div>
          <p class="desc">{{ desc }}</p>
        </div>
      </ng-container>

      <ng-template #missing><p>Group not found.</p></ng-template>
    </div>
  `,
  styles: [`
    .page { max-width: 820px; margin: 16px auto; padding: 0 12px; }
    .back { text-decoration: none; color: #0b64d8; }
    .title { margin: 8px 0 12px; }
    .section { margin: 12px 0; }
    .label { font-weight: 600; margin-bottom: 4px; }
    .members { padding-left: 18px; }
    .desc { margin: 0; }
  `]
})
export class GroupDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(GroupsService);

  group: Group | undefined;

  ngOnInit() {
    // 1) Prefer the object passed via router state (covers newly added items)
    const stateGroup = (history.state && (history.state as any).group) as Group | undefined;
    if (stateGroup) {
      this.group = stateGroup;
      return;
    }
    // 2) Fallback to service for direct URL/refresh
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    this.svc.getById(id).subscribe(g => this.group = g);
  }
}
