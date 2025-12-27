import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SofascoreService, Match, Standing, SeasonInfo, TopPlayer } from '../../services/sofascore.service';

interface MatchGroup {
  date: string;
  round: string;
  matches: Match[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  recentMatches: Match[] = [];
  upcomingMatches: Match[] = [];
  liveMatches: Match[] = [];
  standings: Standing[] = [];
  topScorers: TopPlayer[] = [];
  currentRound: number = 1;
  currentSeason: SeasonInfo | null = null;
  finishedMatchesCount: number = 0;
  
  matchGroups: MatchGroup[] = [];
  
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private sofascoreService: SofascoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to season changes
    this.sofascoreService.currentSeason$
      .pipe(takeUntil(this.destroy$))
      .subscribe(season => {
        this.currentSeason = season;
        this.loadHomeData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSeasonChange(season: SeasonInfo): void {
    this.sofascoreService.setCurrentSeason(season);
  }

  isHistoricalSeason(): boolean {
    return !this.sofascoreService.isCurrentSeason();
  }

  getMatchesSectionTitle(): string {
    return this.isHistoricalSeason() ? 'Season Matches' : 'Recent Matches';
  }

  loadHomeData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      recent: this.sofascoreService.getLastFixtures(),
      upcoming: this.sofascoreService.getNextFixtures(),
      standings: this.sofascoreService.getStandings(),
      topPlayers: this.sofascoreService.getTopPlayers(),
      roundsInfo: this.sofascoreService.getRounds()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // For recent matches, take the most recently played (already sorted by service)
          this.recentMatches = (data.recent || []).slice(0, 10);
          // For upcoming matches, sort by earliest first
          this.upcomingMatches = (data.upcoming || [])
            .sort((a: Match, b: Match) => (a.startTimestamp || 0) - (b.startTimestamp || 0))
            .slice(0, 10);
          this.standings = (data.standings || []).slice(0, 5);
          this.topScorers = (data.topPlayers?.scorers || []).slice(0, 5);
          this.currentRound = data.roundsInfo?.currentRound || 1;
          
          // Calculate finished matches from standings (sum of all team matches / 2)
          const fullStandings = data.standings || [];
          if (fullStandings.length > 0) {
            const totalMatches = fullStandings.reduce((sum: number, s: Standing) => sum + (s.matches || 0), 0);
            this.finishedMatchesCount = Math.floor(totalMatches / 2); // Each match counts twice (home & away)
          } else {
            this.finishedMatchesCount = 380; // Default to full season
          }
          
          this.groupMatchesByDate();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading home data:', err);
          this.error = 'Failed to load data. Please try again later.';
          this.isLoading = false;
        }
      });

    this.liveMatches = [];
  }

  groupMatchesByDate(): void {
    const groups = new Map<string, MatchGroup>();
    
    // Sort matches by date descending (newest first)
    const sortedMatches = [...this.recentMatches].sort((a, b) => {
      return (b.startTimestamp || 0) - (a.startTimestamp || 0);
    });

    sortedMatches.forEach(match => {
      const date = this.formatMatchDate(match);
      const round = `Round ${match.round || 1}`;
      const key = `${date}_${round}`;

      if (!groups.has(key)) {
        groups.set(key, { date, round, matches: [] });
      }
      groups.get(key)!.matches.push(match);
    });

    this.matchGroups = Array.from(groups.values());
  }

  formatMatchDate(match: Match): string {
    if (match.startTimestamp) {
      const date = new Date(match.startTimestamp * 1000);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return 'TBD';
  }

  getMatchTime(match: Match): string {
    if (match.startTimestamp) {
      const date = new Date(match.startTimestamp * 1000);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return 'TBD';
  }

  getMatchStatus(match: Match): string {
    const status = match.status?.type;
    if (status === 'inprogress') return 'LIVE';
    if (status === 'finished') return 'FT';
    if (status === 'notstarted') return this.getMatchTime(match);
    return match.status?.description || 'TBD';
  }

  isMatchFinished(match: Match): boolean {
    return match.status?.type === 'finished';
  }

  getTeamImageUrl(teamId: number): string {
    return this.sofascoreService.getTeamImageUrl(teamId);
  }

  getPlayerImageUrl(playerId: number): string {
    return this.sofascoreService.getPlayerImageUrl(playerId);
  }

  onMatchClick(matchId: number): void {
    this.router.navigate(['/match', matchId]);
  }

  onTeamClick(teamId: number): void {
    this.router.navigate(['/team', teamId]);
  }

  onPlayerClick(playerId: number): void {
    this.router.navigate(['/player', playerId]);
  }

  refresh(): void {
    this.loadHomeData();
  }
}
