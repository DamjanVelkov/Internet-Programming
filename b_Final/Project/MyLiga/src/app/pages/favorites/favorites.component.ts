import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FavoritesService, FavoriteTeam, FavoritePlayer } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favoriteTeams: FavoriteTeam[] = [];
  favoritePlayers: FavoritePlayer[] = [];

  activeTab: 'teams' | 'players' = 'teams';
  isLoading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private favoritesService: FavoritesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read tab from query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab'] === 'players' || params['tab'] === 'teams') {
        this.activeTab = params['tab'];
      }
    });

    this.loadFavorites();

    // Subscribe to favorites changes
    this.favoritesService.favoriteTeams$
      .pipe(takeUntil(this.destroy$))
      .subscribe(teams => {
        this.favoriteTeams = teams;
      });

    this.favoritesService.favoritePlayers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(players => {
        this.favoritePlayers = players;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFavorites(): void {
    this.favoriteTeams = this.favoritesService.getFavoriteTeams();
    this.favoritePlayers = this.favoritesService.getFavoritePlayers();
  }

  setTab(tab: 'teams' | 'players'): void {
    this.activeTab = tab;
  }

  removeTeam(teamId: number, event: Event): void {
    event.stopPropagation();
    this.favoritesService.removeFavoriteTeam(teamId);
  }

  removePlayer(playerId: number, event: Event): void {
    event.stopPropagation();
    this.favoritesService.removeFavoritePlayer(playerId);
  }

  onTeamClick(teamId: number): void {
    // Update URL with current tab before navigating so back button returns to correct tab
    this.router.navigate(['/favorites'], { queryParams: { tab: 'teams' }, replaceUrl: true }).then(() => {
      this.router.navigate(['/team', teamId]);
    });
  }

  onPlayerClick(playerId: number): void {
    // Update URL with current tab before navigating so back button returns to correct tab
    this.router.navigate(['/favorites'], { queryParams: { tab: 'players' }, replaceUrl: true }).then(() => {
      this.router.navigate(['/player', playerId]);
    });
  }

  getTotalFavorites(): number {
    return this.favoriteTeams.length + this.favoritePlayers.length;
  }
}
