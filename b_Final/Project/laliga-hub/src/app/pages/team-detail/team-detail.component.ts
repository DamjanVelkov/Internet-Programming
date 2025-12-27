import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SofascoreService, Team, Player, Standing, Match, SeasonInfo, SEASONS, ACTUAL_CURRENT_SEASON_ID } from '../../services/sofascore.service';
import { FavoritesService, FavoriteTeam } from '../../services/favorites.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {
  team: Team | null = null;
  players: Player[] = [];
  matches: Match[] = [];
  teamPosition: number | null = null;
  teamStats: Standing | null = null;
  loading = true;
  error: string | null = null;
  currentSeasonId: number | null = null;
  seasonDisplay: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private sofascoreService: SofascoreService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    // Listen for both param and query param changes
    this.route.paramMap.subscribe(params => {
      const teamId = params.get('id');
      if (teamId) {
        // Also get the seasonId from query params
        this.route.queryParams.subscribe(queryParams => {
          let seasonId = queryParams['seasonId'] ? +queryParams['seasonId'] : null;
          
          // If no seasonId in query params, use the service's currently selected season
          if (!seasonId) {
            seasonId = this.sofascoreService.getCurrentSeason().id;
          }
          this.currentSeasonId = seasonId;
          
          // Get season display name
          const season = SEASONS.find(s => s.id === seasonId);
          this.seasonDisplay = season ? season.displayName : '';
          
          this.loadTeamData(+teamId);
        });
      }
    });
  }

  loadTeamData(teamId: number): void {
    this.loading = true;
    this.error = null;

    this.sofascoreService.getTeam(teamId).subscribe({
      next: (team) => {
        this.team = team;
        this.loadTeamSquad(teamId);
        this.loadTeamPosition(teamId);
        this.loadTeamMatches(teamId);
      },
      error: (err) => {
        console.error('Error loading team:', err);
        this.error = 'Failed to load team information';
        this.loading = false;
      }
    });
  }

  loadTeamSquad(teamId: number): void {
    // For historical seasons, don't load squad (API only returns current squad)
    if (this.currentSeasonId && this.currentSeasonId !== this.sofascoreService.getCurrentSeason().id) {
      // Historical season - we can't get historical squad from API
      this.players = [];
      this.loading = false;
      return;
    }
    
    this.sofascoreService.getTeamSquad(teamId).subscribe({
      next: (players) => {
        this.players = players || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading squad:', err);
        this.players = [];
        this.loading = false;
      }
    });
  }

  loadTeamPosition(teamId: number): void {
    // Use seasonId if provided (for historical data)
    this.sofascoreService.getStandings(this.currentSeasonId || undefined).subscribe({
      next: (standings) => {
        const teamStanding = standings.find((s: Standing) => s.team?.id === teamId);
        if (teamStanding) {
          this.teamPosition = teamStanding.position;
          this.teamStats = teamStanding;
        }
      },
      error: (err) => {
        console.error('Error loading standings:', err);
      }
    });
  }

  loadTeamMatches(teamId: number): void {
    this.sofascoreService.getTeamMatches(teamId, this.currentSeasonId || undefined).subscribe({
      next: (matches) => {
        // Filter out round 0 and deduplicate by round + teams (not just match ID)
        // This handles rescheduled matches that might have different IDs
        const roundTeamKey = (m: any) => {
          const homeId = m.homeTeam?.id || 0;
          const awayId = m.awayTeam?.id || 0;
          return `${m.round}-${Math.min(homeId, awayId)}-${Math.max(homeId, awayId)}`;
        };
        
        const uniqueMatches = new Map<string, any>();
        (matches || []).forEach(m => {
          if ((m.round || 0) > 0) {
            const key = roundTeamKey(m);
            // If we already have this match, prefer the finished one or the one with later timestamp
            if (!uniqueMatches.has(key)) {
              uniqueMatches.set(key, m);
            } else {
              const existing = uniqueMatches.get(key);
              // Prefer finished matches over unfinished
              if (m.status?.type === 'finished' && existing.status?.type !== 'finished') {
                uniqueMatches.set(key, m);
              } else if (m.status?.type === existing.status?.type) {
                // If same status, prefer later timestamp (more recent data)
                if ((m.startTimestamp || 0) > (existing.startTimestamp || 0)) {
                  uniqueMatches.set(key, m);
                }
              }
            }
          }
        });
        this.matches = Array.from(uniqueMatches.values())
          .sort((a, b) => (a.round || 0) - (b.round || 0));
      },
      error: (err) => {
        console.error('Error loading team matches:', err);
        this.matches = [];
      }
    });
  }

  get isFavorite(): boolean {
    return this.team ? this.favoritesService.isTeamFavorite(this.team.id) : false;
  }

  toggleFavorite(): void {
    if (this.team) {
      const favoriteTeam: FavoriteTeam = {
        id: this.team.id,
        name: this.team.name,
        logo: this.getTeamLogo(this.team.id)
      };
      this.favoritesService.toggleTeamFavorite(favoriteTeam);
    }
  }

  getTeamLogo(teamId: number): string {
    return this.sofascoreService.getTeamImageUrl(teamId);
  }

  getPlayerImage(playerId: number): string {
    return this.sofascoreService.getPlayerImageUrl(playerId);
  }

  getCoachPlaceholder(): string {
    return 'https://www.sofascore.com/static/images/placeholders/player.svg';
  }

  viewPlayer(playerId: number): void {
    this.router.navigate(['/player', playerId]);
  }

  goBack(): void {
    this.location.back();
  }

  viewMatch(matchId: number): void {
    this.router.navigate(['/match', matchId]);
  }

  isMatchFinished(match: Match): boolean {
    return match.status?.type === 'finished';
  }

  getMatchResult(match: Match): string {
    if (!this.team || !this.isMatchFinished(match)) return '';
    const isHome = match.homeTeam?.id === this.team.id;
    const teamScore = isHome ? match.homeScore?.current : match.awayScore?.current;
    const oppScore = isHome ? match.awayScore?.current : match.homeScore?.current;
    
    if (teamScore === undefined || oppScore === undefined) return '';
    if (teamScore > oppScore) return 'W';
    if (teamScore < oppScore) return 'L';
    return 'D';
  }

  getMatchDate(match: Match): string {
    if (!match.startTimestamp) return 'TBD';
    return new Date(match.startTimestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getMatchTime(match: Match): string {
    if (!match.startTimestamp) return '';
    return new Date(match.startTimestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  isHistoricalSeason(): boolean {
    // If no seasonId in URL, we're viewing current season (not historical)
    if (!this.currentSeasonId) return false;
    // Compare against the actual current season where squad data is available
    return this.currentSeasonId !== ACTUAL_CURRENT_SEASON_ID;
  }
}
