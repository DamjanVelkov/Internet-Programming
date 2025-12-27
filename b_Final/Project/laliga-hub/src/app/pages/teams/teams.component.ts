import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SofascoreService, Standing, SeasonInfo } from '../../services/sofascore.service';
import { FavoritesService } from '../../services/favorites.service';

interface TeamDisplay {
  id: number;
  name: string;
  shortName?: string;
  logo?: string;
}

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit, OnDestroy {
  teams: TeamDisplay[] = [];
  filteredTeams: TeamDisplay[] = [];
  searchQuery: string = '';
  sortBy: 'name' = 'name';
  currentSeason: SeasonInfo | null = null;
  
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private sofascoreService: SofascoreService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sofascoreService.currentSeason$
      .pipe(takeUntil(this.destroy$))
      .subscribe(season => {
        this.currentSeason = season;
        this.loadTeams();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSeasonChange(season: SeasonInfo): void {
    this.sofascoreService.setCurrentSeason(season);
  }

  loadTeams(): void {
    this.isLoading = true;
    this.error = null;

    // Get teams from standings (since SofaScore doesn't have a direct teams endpoint)
    this.sofascoreService.getStandings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (standings) => {
          this.teams = standings.map(s => ({
            id: s.team.id,
            name: s.team.name,
            shortName: s.team.shortName,
            logo: this.sofascoreService.getTeamImageUrl(s.team.id)
          }));
          this.sortTeams();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading teams:', err);
          this.error = 'Failed to load teams. Please try again.';
          this.isLoading = false;
        }
      });
  }

  sortTeams(): void {
    let sorted = [...this.teams];
    
    if (this.sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.applyFilter(sorted);
  }

  applyFilter(teams?: TeamDisplay[]): void {
    const source = teams || this.teams;
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      this.filteredTeams = source.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.shortName?.toLowerCase().includes(query)
      );
    } else {
      this.filteredTeams = source;
    }
  }

  onSearch(): void {
    this.sortTeams();
  }

  setSortBy(sort: 'name'): void {
    this.sortBy = sort;
    this.sortTeams();
  }

  isFavorite(teamId: number): boolean {
    return this.favoritesService.isTeamFavorite(teamId);
  }

  toggleFavorite(event: Event, team: TeamDisplay): void {
    event.stopPropagation();
    this.favoritesService.toggleTeamFavorite({
      id: team.id,
      name: team.name,
      logo: team.logo || ''
    });
  }

  onTeamClick(teamId: number): void {
    this.router.navigate(['/team', teamId]);
  }
}
