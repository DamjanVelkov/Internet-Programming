// // IMERATIVNO SO SUBSCRIBE + TAP
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { EpisodesService } from './episodes.service';
// import { Episode } from './episode.model';
// import { tap, catchError, of } from 'rxjs';

// @Component({
//   standalone: true,
//   selector: 'app-episodes-list',
//   imports: [CommonModule, RouterLink],
//   template: `
//     <div class="page">
//       <h1>Episodes</h1>

//       <div class="banner" *ngIf="loading">Loading…</div>
//       <div class="banner err" *ngIf="error">{{ error }}</div>

//       <table *ngIf="!loading && !error">
//         <thead>
//           <tr><th>ID</th><th>Title</th><th>Era</th><th>Year</th></tr>
//         </thead>
//         <tbody>
//           <tr *ngFor="let e of data" [routerLink]="['/episodes', e.id]">
//             <td>{{ e.id }}</td>
//             <td class="title">{{ e.title }}</td>
//             <td>{{ e.era }}</td>
//             <td>{{ yearOf(e.broadcast_date) }}</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   `,
//   styles: [`.page{max-width:900px;margin:16px auto;padding:0 12px}
//     .banner{padding:8px 10px;border:1px solid #ddd;border-radius:8px;margin:8px 0 12px;background:#fafafa}
//     .banner.err{background:#ffecec;border-color:#ffc8c8}
//     table{width:100%;border-collapse:collapse}
//     th,td{padding:8px 10px;border-bottom:1px solid #eee}
//     tr{cursor:pointer} tr:hover{background:#fafafa}
//     .title{font-weight:600}`]
// })
// export class EpisodesListComponent implements OnInit {
//   loading = true;
//   error: string | null = null;
//   data: Episode[] = [];

//   constructor(private svc: EpisodesService) {}

//   ngOnInit(): void {
//     this.svc.getAll().pipe(
//       tap(res => console.log('[LIST] got episodes:', res)),   // <-- tap за дебаг
//       catchError(err => {
//         console.error('[LIST] error:', err);
//         this.error = 'Failed to load episodes.json';
//         this.loading = false;
//         return of([] as Episode[]);
//       })
//     ).subscribe(res => {
//       this.data = res;
//       this.loading = false;
//     });
//   }

//   yearOf(dateStr: string): number {
//     const d = new Date(dateStr);
//     return isNaN(d.getTime()) ? NaN : d.getFullYear();
//   }
// }


// DEKLARATIVNO SO ASYNC PIPE
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EpisodesService } from './episodes';
import { Episode } from './episode.model';
import { Observable, map, startWith, catchError, of, tap } from 'rxjs';

type Vm = { loading: boolean; error: string | null; data: Episode[] };

@Component({
  standalone: true,
  selector: 'app-episodes-list',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page" *ngIf="vm$ | async as vm">
      <h1>Episodes</h1>

      <div class="banner" *ngIf="vm.loading">Loading…</div>
      <div class="banner err" *ngIf="vm.error">{{ vm.error }}</div>

      <table *ngIf="!vm.loading && !vm.error">
        <thead>
          <tr><th>ID</th><th>Title</th><th>Era</th><th>Year</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of vm.data" [routerLink]="['/episodes', e.id]">
            <td>{{ e.id }}</td>
            <td class="title">{{ e.title }}</td>
            <td>{{ e.era }}</td>
            <td>{{ yearOf(e.broadcast_date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page{max-width:900px;margin:16px auto;padding:0 12px}
    .banner{padding:8px 10px;border:1px solid #ddd;border-radius:8px;margin:8px 0 12px;background:#fafafa}
    .banner.err{background:#ffecec;border-color:#ffc8c8}
    table{width:100%;border-collapse:collapse}
    th,td{padding:8px 10px;border-bottom:1px solid #eee}
    tr{cursor:pointer} tr:hover{background:#fafafa}
    .title{font-weight:600}
  `]s
})
export class EpisodesListComponent {
  vm$: Observable<Vm>;

  constructor(private svc: EpisodesService) {
    this.vm$ = this.svc.getAll().pipe(
      tap(res => console.log('[LIST] got episodes:', res)), // tap for debugging
      map(data => ({ loading: false, error: null, data })),
      startWith({ loading: true, error: null, data: [] as Episode[] }),
      catchError(() => of({ loading: false, error: 'Failed to load episodes.json', data: [] as Episode[] }))
    );
  }

  yearOf(dateStr: string): number {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? NaN : d.getFullYear();
  }
}
