import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SofascoreService, Standing, SeasonInfo } from '../../services/sofascore.service';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css']
})
export class StandingsComponent implements OnInit, OnDestroy {
  standings: Standing[] = [];
  isLoading = true;
  error: string | null = null;
  currentSeason: SeasonInfo | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private sofascoreService: SofascoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sofascoreService.currentSeason$
      .pipe(takeUntil(this.destroy$))
      .subscribe(season => {
        this.currentSeason = season;
        this.loadStandings();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSeasonChange(season: SeasonInfo): void {
    this.sofascoreService.setCurrentSeason(season);
  }

  loadStandings(): void {
    this.isLoading = true;
    this.error = null;

    this.sofascoreService.getStandings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (standings) => {
          this.standings = standings;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading standings:', err);
          this.error = 'Failed to load standings. Please try again.';
          this.isLoading = false;
        }
      });
  }

  getTeamImageUrl(teamId: number): string {
    return this.sofascoreService.getTeamImageUrl(teamId);
  }

  getPositionClass(rank: number): string {
    if (rank <= 4) return 'champions-league';
    if (rank === 5) return 'europa-league';
    if (rank === 6) return 'conference-league';
    if (rank >= 18) return 'relegation';
    return '';
  }

  getPositionDescription(rank: number): string {
    if (rank <= 4) return 'UEFA Champions League';
    if (rank === 5) return 'UEFA Europa League';
    if (rank === 6) return 'UEFA Conference League';
    if (rank >= 18) return 'Relegation Zone';
    return '';
  }

  onTeamClick(teamId: number): void {
    // Always pass seasonId to team detail so it knows which season we're viewing
    if (this.currentSeason) {
      this.router.navigate(['/team', teamId], { queryParams: { seasonId: this.currentSeason.id } });
    } else {
      this.router.navigate(['/team', teamId]);
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-team.png';
  }
}
