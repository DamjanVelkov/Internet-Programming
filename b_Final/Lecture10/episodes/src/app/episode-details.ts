// IMERATIVNO SO SUBSCRIBE + TAP
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EpisodesService } from './episodes';
import { Episode } from './episode.model';
import { tap, catchError, of, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-episode-details',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <a routerLink="/" class="back">← Back</a>

      <div class="banner" *ngIf="loading">Loading…</div>
      <div class="banner err" *ngIf="error">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <ng-container *ngIf="data as e; else missing">
          <h2 class="title">{{ e.title }}</h2>
          <div class="grid">
            <div><b>ID:</b> {{ e.id }}</div>
            <div><b>Era:</b> {{ e.era }}</div>
            <div><b>Year:</b> {{ yearOf(e.broadcast_date) }}</div>
            <div><b>Director:</b> {{ e.director }}</div>
            <div><b>Writer:</b> {{ e.writer }}</div>
            <div><b>Doctor:</b> {{ e.doctor.actor }} ({{ e.doctor.incarnation }})</div>
            <div *ngIf="e.companion"><b>Companion:</b> {{ e.companion.actor }} — {{ e.companion.character }}</div>
          </div>
          <h3>Plot</h3><p>{{ e.plot }}</p>
          <h3>Cast</h3>
          <ul><li *ngFor="let c of e.cast">{{ c.actor }} — {{ c.character }}</li></ul>
        </ng-container>
      </ng-container>

      <ng-template #missing><p>Episode not found.</p></ng-template>
    </div>
  `,
  styles: [`.page{max-width:900px;margin:16px auto;padding:0 12px}
    .back{color:#0b64d8;text-decoration:none}
    .banner{padding:8px 10px;border:1px solid #ddd;border-radius:8px;margin:8px 0 12px;background:#fafafa}
    .banner.err{background:#ffecec;border-color:#ffc8c8}
    .title{margin:8px 0 12px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px 16px;margin:10px 0 6px}`]
})
export class EpisodeDetailsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  data: Episode | undefined;

  constructor(private route: ActivatedRoute, private svc: EpisodesService) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(pm => console.log('[DETAILS] paramMap:', pm.get('id'))), // <-- tap
      switchMap(pm => {
        const id = Number(pm.get('id'));
        return this.svc.getOne(id).pipe(
          tap(ep => console.log('[DETAILS] episode:', ep)),       // <-- tap
          catchError(err => {
            console.error('[DETAILS] error:', err);
            this.error = 'Failed to load details';
            this.loading = false;
            return of(undefined);
          })
        );
      })
    ).subscribe(ep => {
      this.data = ep;
      this.loading = false;
      if (!ep) this.error = null; // ќе покаже "Episode not found." преку template
    });
  }

  yearOf(dateStr: string): number {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? NaN : d.getFullYear();
  }
}


// DEKLARATIVNO SO ASYNC PIPE
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { EpisodesService } from './episodes.service';
// import { Episode } from './episode.model';
// import { Observable, map, switchMap, startWith, catchError, of, tap } from 'rxjs';

// type Vm = { loading: boolean; error: string | null; data: Episode | undefined };

// @Component({
//   standalone: true,
//   selector: 'app-episode-details',
//   imports: [CommonModule, RouterLink],
//   template: `
//     <div class="page" *ngIf="vm$ | async as vm">
//       <a routerLink="/" class="back">← Back</a>

//       <div class="banner" *ngIf="vm.loading">Loading…</div>
//       <div class="banner err" *ngIf="vm.error">{{ vm.error }}</div>

//       <ng-container *ngIf="!vm.loading && !vm.error">
//         <ng-container *ngIf="vm.data as e; else missing">
//           <h2 class="title">{{ e.title }}</h2>
//           <div class="grid">
//             <div><b>ID:</b> {{ e.id }}</div>
//             <div><b>Era:</b> {{ e.era }}</div>
//             <div><b>Year:</b> {{ yearOf(e.broadcast_date) }}</div>
//             <div><b>Director:</b> {{ e.director }}</div>
//             <div><b>Writer:</b> {{ e.writer }}</div>
//             <div><b>Doctor:</b> {{ e.doctor.actor }} ({{ e.doctor.incarnation }})</div>
//             <div *ngIf="e.companion"><b>Companion:</b> {{ e.companion.actor }} — {{ e.companion.character }}</div>
//           </div>

//           <h3>Plot</h3>
//           <p>{{ e.plot }}</p>

//           <h3>Cast</h3>
//           <ul>
//             <li *ngFor="let c of e.cast">{{ c.actor }} — {{ c.character }}</li>
//           </ul>
//         </ng-container>
//       </ng-container>

//       <ng-template #missing><p>Episode not found.</p></ng-template>
//     </div>
//   `,
//   styles: [`
//     .page{max-width:900px;margin:16px auto;padding:0 12px}
//     .back{color:#0b64d8;text-decoration:none}
//     .banner{padding:8px 10px;border:1px solid #ddd;border-radius:8px;margin:8px 0 12px;background:#fafafa}
//     .banner.err{background:#ffecec;border-color:#ffc8c8}
//     .title{margin:8px 0 12px}
//     .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px 16px;margin:10px 0 6px}
//   `]
// })
// export class EpisodeDetailsComponent {
//   vm$: Observable<Vm> = this.route.paramMap.pipe(
//     tap(pm => console.log('[DETAILS] param id:', pm.get('id'))), // tap for debugging
//     map(pm => Number(pm.get('id'))),
//     switchMap(id => this.svc.getOne(id).pipe(
//       tap(ep => console.log('[DETAILS] episode:', ep)),          // tap for debugging
//       map(data => ({ loading: false, error: null, data })),
//       startWith({ loading: true, error: null, data: undefined as Episode | undefined }),
//       catchError(() => of({ loading: false, error: 'Failed to load details', data: undefined as Episode | undefined }))
//     ))
//   );

//   constructor(private route: ActivatedRoute, private svc: EpisodesService) {}

//   yearOf(dateStr: string): number {
//     const d = new Date(dateStr);
//     return isNaN(d.getTime()) ? NaN : d.getFullYear();
//   }
// }

