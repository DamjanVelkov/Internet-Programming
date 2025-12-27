import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SofascoreService, Standing, SeasonInfo, TopPlayer } from '../../services/sofascore.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, OnDestroy {
  topAttack: Standing[] = [];
  topDefense: Standing[] = [];
  topWins: Standing[] = [];
  mostGoals: Standing[] = [];
  topScorers: TopPlayer[] = [];
  topAssists: TopPlayer[] = [];
  currentSeason: SeasonInfo | null = null;

  activeTab: 'attack' | 'defense' | 'wins' | 'goals' | 'scorers' | 'assists' = 'scorers';
  
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private sofascoreService: SofascoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for tab query param
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['tab']) {
          this.activeTab = params['tab'] as any;
        }
      });

    this.sofascoreService.currentSeason$
      .pipe(takeUntil(this.destroy$))
      .subscribe(season => {
        this.currentSeason = season;
        this.loadStats();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSeasonChange(season: SeasonInfo): void {
    this.sofascoreService.setCurrentSeason(season);
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      standings: this.sofascoreService.getStandings(),
      topPlayers: this.sofascoreService.getTopPlayers()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ standings, topPlayers }) => {
          // Sort by goals scored (best attack)
          this.topAttack = [...standings].sort((a, b) => b.scoresFor - a.scoresFor).slice(0, 10);
          
          // Sort by goals against ascending (best defense)
          this.topDefense = [...standings].sort((a, b) => a.scoresAgainst - b.scoresAgainst).slice(0, 10);
          
          // Sort by wins
          this.topWins = [...standings].sort((a, b) => b.wins - a.wins).slice(0, 10);
          
          // Sort by total goals (scored + against = most entertaining)
          this.mostGoals = [...standings].sort((a, b) => (b.scoresFor + b.scoresAgainst) - (a.scoresFor + a.scoresAgainst)).slice(0, 10);

          // Top scorers and assists
          this.topScorers = (topPlayers?.scorers || []).slice(0, 10);
          this.topAssists = (topPlayers?.assists || []).slice(0, 10);
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading stats:', err);
          this.error = 'Failed to load statistics. Please try again.';
          this.isLoading = false;
        }
      });
  }

  setTab(tab: 'attack' | 'defense' | 'wins' | 'goals' | 'scorers' | 'assists'): void {
    this.activeTab = tab;
    this.router.navigate([], {
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  getCurrentList(): Standing[] {
    switch (this.activeTab) {
      case 'attack':
        return this.topAttack;
      case 'defense':
        return this.topDefense;
      case 'wins':
        return this.topWins;
      case 'goals':
        return this.mostGoals;
      default:
        return [];
    }
  }

  getStatValue(team: Standing): number {
    switch (this.activeTab) {
      case 'attack':
        return team.scoresFor;
      case 'defense':
        return team.scoresAgainst;
      case 'wins':
        return team.wins;
      case 'goals':
        return team.scoresFor + team.scoresAgainst;
      default:
        return 0;
    }
  }

  getStatLabel(): string {
    switch (this.activeTab) {
      case 'attack':
        return 'Goals Scored';
      case 'defense':
        return 'Goals Conceded';
      case 'wins':
        return 'Wins';
      case 'goals':
        return 'Total Goals';
      case 'scorers':
        return 'Goals';
      case 'assists':
        return 'Assists';
      default:
        return 'Value';
    }
  }

  getTabTitle(): string {
    switch (this.activeTab) {
      case 'attack':
        return 'Best Attack';
      case 'defense':
        return 'Best Defense';
      case 'wins':
        return 'Most Wins';
      case 'goals':
        return 'Most Entertaining';
      case 'scorers':
        return 'Top Scorers';
      case 'assists':
        return 'Top Assists';
      default:
        return 'Statistics';
    }
  }

  onTeamClick(teamId: number): void {
    // Navigate with season context so old seasons show that season's data
    if (this.currentSeason) {
      this.router.navigate(['/team', teamId], {
        queryParams: { seasonId: this.currentSeason.id }
      });
    } else {
      this.router.navigate(['/team', teamId]);
    }
  }

  onPlayerClick(playerId: number): void {
    this.router.navigate(['/player', playerId]);
  }

  getTeamImageUrl(teamId: number): string {
    return this.sofascoreService.getTeamImageUrl(teamId);
  }

  getPlayerImageUrl(playerId: number): string {
    return this.sofascoreService.getPlayerImageUrl(playerId);
  }
}
