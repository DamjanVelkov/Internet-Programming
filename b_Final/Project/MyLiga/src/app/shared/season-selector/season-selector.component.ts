import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SofascoreService, SeasonInfo, SEASONS } from '../../services/sofascore.service';

@Component({
  selector: 'app-season-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="season-selector">
      <label for="season-select" class="season-label">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="calendar-icon">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-5H7v-2h5v2zm5-4H7v-2h10v2z"/>
        </svg>
        Season
      </label>
      <div class="select-wrapper">
        <select 
          id="season-select" 
          [ngModel]="selectedSeasonId"
          (ngModelChange)="onSeasonChange($event)"
          class="season-select"
        >
          <option *ngFor="let season of seasons" [ngValue]="season.id">
            {{ season.displayName }}
          </option>
        </select>
        <div class="select-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
      </div>
      <span class="data-source-badge" [class.live]="isLatestSeason">
        {{ isLatestSeason ? 'CURRENT' : 'HISTORICAL' }}
      </span>
    </div>
  `,
  styles: [`
    .season-selector {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--card-background, #ffffff);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .season-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      font-size: 0.9rem;
    }

    .calendar-icon {
      width: 18px;
      height: 18px;
      fill: var(--primary-color, #ee324e);
    }

    .select-wrapper {
      position: relative;
      min-width: 150px;
    }

    .season-select {
      width: 100%;
      padding: 10px 36px 10px 14px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary, #1a1a1a);
      background: var(--background-secondary, #f5f5f5);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      appearance: none;
      transition: all 0.2s ease;
    }

    .season-select:hover {
      border-color: var(--primary-color, #ee324e);
    }

    .season-select:focus {
      outline: none;
      border-color: var(--primary-color, #ee324e);
      box-shadow: 0 0 0 3px rgba(238, 50, 78, 0.2);
    }

    .select-arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--text-secondary, #666);
    }

    .select-arrow svg {
      width: 20px;
      height: 20px;
    }

    .data-source-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 0;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 20px;
      background: var(--background-secondary, #f0f0f0);
      color: var(--text-secondary, #666);
      width: 100px;
    }

    .data-source-badge.live {
      background: linear-gradient(135deg, #ff4757 0%, #ee324e 100%);
      color: white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Dark mode styles */
    :host-context(.dark-theme) .season-selector {
      background: var(--card-background, #1e1e1e);
    }

    :host-context(.dark-theme) .season-select {
      background: var(--background-secondary, #2d2d2d);
      color: var(--text-primary, #ffffff);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .season-selector {
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        padding: 12px;
      }

      .season-label {
        width: 100%;
        justify-content: center;
      }

      .select-wrapper {
        flex: 1;
        min-width: 120px;
      }
    }
  `]
})
export class SeasonSelectorComponent implements OnInit, OnDestroy {
  @Output() seasonChange = new EventEmitter<SeasonInfo>();

  selectedSeasonId: number = SEASONS[0].id;
  isLatestSeason: boolean = true;
  seasons: SeasonInfo[] = SEASONS;

  private subscription?: Subscription;

  constructor(private sofascoreService: SofascoreService) {}

  ngOnInit(): void {
    // Subscribe to current season changes
    this.subscription = this.sofascoreService.currentSeason$.subscribe(season => {
      this.selectedSeasonId = season.id;
      this.isLatestSeason = this.sofascoreService.isCurrentSeason();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  isCurrentSeason(season: SeasonInfo): boolean {
    return season.id === SEASONS[0].id;
  }

  onSeasonChange(seasonId: number): void {
    const selected = this.seasons.find(s => s.id === seasonId);
    if (selected) {
      this.sofascoreService.setCurrentSeason(selected);
      this.seasonChange.emit(selected);
    }
  }
}
