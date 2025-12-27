import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SofascoreService, SeasonInfo, SEASONS } from '../../services/sofascore.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-season-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="season-selector">
      <div class="current-badge" *ngIf="isCurrentSeason()">CURRENT</div>
      <select 
        [ngModel]="selectedSeasonId" 
        (ngModelChange)="onSeasonChange($event)"
        class="season-dropdown"
      >
        <option *ngFor="let season of seasons" [ngValue]="season.id">
          {{ season.displayName }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .season-selector {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .current-badge {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .season-dropdown {
      padding: 8px 32px 8px 12px;
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      min-width: 140px;
    }

    .season-dropdown:hover {
      background-color: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .season-dropdown:focus {
      outline: none;
      border-color: #e63946;
      box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.2);
    }

    .season-dropdown option {
      background-color: #1a1a2e;
      color: #ffffff;
      padding: 8px;
    }
  `]
})
export class SeasonSelectorComponent implements OnInit, OnDestroy {
  @Output() seasonChange = new EventEmitter<SeasonInfo>();
  
  seasons: SeasonInfo[] = SEASONS;
  selectedSeasonId: number = SEASONS[0].id;
  
  private subscription: Subscription | null = null;

  constructor(private sofascoreService: SofascoreService) {}

  ngOnInit(): void {
    this.subscription = this.sofascoreService.currentSeason$.subscribe(season => {
      this.selectedSeasonId = season.id;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  isCurrentSeason(): boolean {
    return this.selectedSeasonId === SEASONS[0].id;
  }

  onSeasonChange(seasonId: number): void {
    const season = this.seasons.find(s => s.id === seasonId);
    if (season) {
      this.sofascoreService.setCurrentSeason(season);
      this.seasonChange.emit(season);
    }
  }
}
