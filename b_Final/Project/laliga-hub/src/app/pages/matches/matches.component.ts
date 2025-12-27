import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SofascoreService, Match, SeasonInfo } from '../../services/sofascore.service';

interface MatchGroup {
  round: number;
  matches: Match[];
}

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit, OnDestroy {
  matchGroups: MatchGroup[] = [];
  currentRound = 1;
  selectedRound = 1;
  totalRounds = 38;
  rounds: number[] = [];
  
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
        this.loadRoundsInfo();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSeasonChange(season: SeasonInfo): void {
    this.sofascoreService.setCurrentSeason(season);
  }

  loadRoundsInfo(): void {
    this.isLoading = true;
    this.error = null;

    this.sofascoreService.getRounds()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (info) => {
          this.currentRound = info.currentRound;
          this.selectedRound = info.currentRound;
          this.rounds = info.rounds.length > 0 ? info.rounds : Array.from({ length: 38 }, (_, i) => i + 1);
          this.totalRounds = this.rounds.length || 38;
          this.loadMatchesForRound(this.selectedRound);
        },
        error: (err) => {
          console.error('Error loading rounds:', err);
          this.rounds = Array.from({ length: 38 }, (_, i) => i + 1);
          this.selectedRound = 1;
          this.loadMatchesForRound(1);
        }
      });
  }

  loadMatchesForRound(round: number): void {
    this.isLoading = true;
    this.error = null;
    this.selectedRound = round;

    this.sofascoreService.getMatchesByRound(round)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (matches) => {
          this.matchGroups = [{
            round: round,
            matches: matches.sort((a, b) => a.startTimestamp - b.startTimestamp)
          }];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading matches:', err);
          this.error = 'Failed to load matches. Please try again.';
          this.isLoading = false;
        }
      });
  }

  previousRound(): void {
    if (this.selectedRound > 1) {
      this.loadMatchesForRound(this.selectedRound - 1);
    }
  }

  nextRound(): void {
    if (this.selectedRound < this.totalRounds) {
      this.loadMatchesForRound(this.selectedRound + 1);
    }
  }

  goToCurrentRound(): void {
    this.loadMatchesForRound(this.currentRound);
  }

  onRoundSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const round = parseInt(select.value, 10);
    this.loadMatchesForRound(round);
  }

  getTeamImageUrl(teamId: number): string {
    return this.sofascoreService.getTeamImageUrl(teamId);
  }

  getMatchDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  getMatchStatus(match: Match): string {
    const statusCode = match.status?.code || 0;
    
    // Finished
    if (statusCode === 100) return 'FT';
    // Not started
    if (statusCode === 0) return this.formatTime(match.startTimestamp);
    // Live statuses
    if (statusCode >= 6 && statusCode <= 14) return 'LIVE';
    // Half time
    if (statusCode === 31) return 'HT';
    // After extra time
    if (statusCode === 110) return 'AET';
    // After penalties
    if (statusCode === 120) return 'AP';
    // Postponed
    if (statusCode === 60) return 'PP';
    // Cancelled
    if (statusCode === 70) return 'CAN';
    
    return match.status?.description || '';
  }

  isMatchFinished(match: Match): boolean {
    return match.status?.code === 100 || match.status?.code === 110 || match.status?.code === 120;
  }

  isMatchLive(match: Match): boolean {
    const code = match.status?.code || 0;
    return (code >= 6 && code <= 14) || code === 31;
  }

  isMatchUpcoming(match: Match): boolean {
    return match.status?.code === 0;
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  onMatchClick(match: Match): void {
    this.router.navigate(['/match', match.id]);
  }

  onTeamClick(teamId: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/team', teamId]);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-team.png';
  }
}
