import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Team, Player } from '../models/football.models';

export interface FavoriteTeam {
  id: number;
  name: string;
  logo: string;
}

export interface FavoritePlayer {
  id: number;
  name: string;
  photo: string;
  teamName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly TEAMS_KEY = 'laliga_favorite_teams';
  private readonly PLAYERS_KEY = 'laliga_favorite_players';
  private isBrowser: boolean;
  
  private favoriteTeamsSubject: BehaviorSubject<FavoriteTeam[]>;
  private favoritePlayersSubject: BehaviorSubject<FavoritePlayer[]>;
  
  public favoriteTeams$: Observable<FavoriteTeam[]>;
  public favoritePlayers$: Observable<FavoritePlayer[]>;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.favoriteTeamsSubject = new BehaviorSubject<FavoriteTeam[]>(this.loadFavoriteTeams());
    this.favoritePlayersSubject = new BehaviorSubject<FavoritePlayer[]>(this.loadFavoritePlayers());
    this.favoriteTeams$ = this.favoriteTeamsSubject.asObservable();
    this.favoritePlayers$ = this.favoritePlayersSubject.asObservable();
  }

  private loadFavoriteTeams(): FavoriteTeam[] {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem(this.TEAMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadFavoritePlayers(): FavoritePlayer[] {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem(this.PLAYERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveTeams(teams: FavoriteTeam[]): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.TEAMS_KEY, JSON.stringify(teams));
      } catch { /* ignore */ }
    }
    this.favoriteTeamsSubject.next(teams);
  }

  private savePlayers(players: FavoritePlayer[]): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(players));
      } catch { /* ignore */ }
    }
    this.favoritePlayersSubject.next(players);
  }

  // Team favorites
  addFavoriteTeam(team: FavoriteTeam): void {
    const teams = this.favoriteTeamsSubject.value;
    if (!teams.find(t => t.id === team.id)) {
      this.saveTeams([...teams, team]);
    }
  }

  removeFavoriteTeam(teamId: number): void {
    const teams = this.favoriteTeamsSubject.value.filter(t => t.id !== teamId);
    this.saveTeams(teams);
  }

  isTeamFavorite(teamId: number): boolean {
    return this.favoriteTeamsSubject.value.some(t => t.id === teamId);
  }

  toggleTeamFavorite(team: FavoriteTeam): void {
    if (this.isTeamFavorite(team.id)) {
      this.removeFavoriteTeam(team.id);
    } else {
      this.addFavoriteTeam(team);
    }
  }

  // Player favorites
  addFavoritePlayer(player: FavoritePlayer): void {
    const players = this.favoritePlayersSubject.value;
    if (!players.find(p => p.id === player.id)) {
      this.savePlayers([...players, player]);
    }
  }

  removeFavoritePlayer(playerId: number): void {
    const players = this.favoritePlayersSubject.value.filter(p => p.id !== playerId);
    this.savePlayers(players);
  }

  isPlayerFavorite(playerId: number): boolean {
    return this.favoritePlayersSubject.value.some(p => p.id === playerId);
  }

  togglePlayerFavorite(player: FavoritePlayer): void {
    if (this.isPlayerFavorite(player.id)) {
      this.removeFavoritePlayer(player.id);
    } else {
      this.addFavoritePlayer(player);
    }
  }

  getFavoriteTeams(): FavoriteTeam[] {
    return this.favoriteTeamsSubject.value;
  }

  getFavoritePlayers(): FavoritePlayer[] {
    return this.favoritePlayersSubject.value;
  }

  clearAllFavorites(): void {
    localStorage.removeItem(this.TEAMS_KEY);
    localStorage.removeItem(this.PLAYERS_KEY);
    this.favoriteTeamsSubject.next([]);
    this.favoritePlayersSubject.next([]);
  }
}
