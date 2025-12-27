import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SofascoreService, Player } from '../../services/sofascore.service';
import { FavoritesService } from '../../services/favorites.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.component.html',
  styleUrls: ['./player-detail.component.css']
})
export class PlayerDetailComponent implements OnInit, OnDestroy {
  player: Player | null = null;
  isLoading = true;
  error: string | null = null;
  isLaLigaTeam = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private sofascoreService: SofascoreService,
    private favoritesService: FavoritesService
  ) {}

  get isFavorite(): boolean {
    return this.player ? this.favoritesService.isPlayerFavorite(this.player.id) : false;
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const playerId = +params['id'];
        if (playerId) {
          this.loadPlayer(playerId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFavorite(): void {
    if (!this.player) return;
    
    if (this.isFavorite) {
      this.favoritesService.removeFavoritePlayer(this.player.id);
    } else {
      this.favoritesService.addFavoritePlayer({
        id: this.player.id,
        name: this.player.name,
        photo: this.getPlayerImageUrl(this.player.id),
        teamName: this.player.team?.name || ''
      });
    }
  }

  loadPlayer(playerId: number): void {
    this.isLoading = true;
    this.error = null;
    this.isLaLigaTeam = false;

    this.sofascoreService.getPlayer(playerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (player) => {
          if (player) {
            this.player = player;
            // Check if player's team is in LaLiga
            if (player.team?.id) {
              this.sofascoreService.isLaLigaTeam(player.team.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe(isLaLiga => {
                  this.isLaLigaTeam = isLaLiga;
                });
            }
          } else {
            this.error = 'Player not found';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading player:', err);
          this.error = 'Failed to load player details';
          this.isLoading = false;
        }
      });
  }

  getPlayerImageUrl(playerId: number): string {
    return this.sofascoreService.getPlayerImageUrl(playerId);
  }

  getTeamImageUrl(teamId: number): string {
    return this.sofascoreService.getTeamImageUrl(teamId);
  }

  getAge(): number | null {
    if (this.player?.dateOfBirthTimestamp) {
      const birthDate = new Date(this.player.dateOfBirthTimestamp * 1000);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  }

  getBirthDate(): string {
    if (this.player?.dateOfBirthTimestamp) {
      return new Date(this.player.dateOfBirthTimestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Unknown';
  }

  onTeamClick(): void {
    if (this.player?.team?.id && this.isLaLigaTeam) {
      this.router.navigate(['/team', this.player.team.id]);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
