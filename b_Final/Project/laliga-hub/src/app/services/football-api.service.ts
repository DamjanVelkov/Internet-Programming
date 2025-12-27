import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  Match,
  Standing,
  StandingsResponse,
  TeamDetails,
  Player,
  PlayerStatistics,
  MatchEvent,
  Lineup,
  MatchStatistic,
  TopScorer,
  Round,
  H2H,
  CachedData
} from '../models/football.models';

@Injectable({
  providedIn: 'root'
})
export class FootballApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiKey = environment.apiKey;
  private readonly leagueId = environment.laLigaId;
  private readonly season = environment.currentSeason;
  private readonly cacheExpiration = environment.cacheExpirationMinutes * 60 * 1000;
  private isBrowser: boolean;

  // Cache storage
  private cache = new Map<string, CachedData<any>>();
  
  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // API calls counter (free tier has daily limits)
  private apiCallsToday = 0;
  private readonly maxDailyCallsFree = 100;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCacheFromStorage();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-apisports-key': this.apiKey
    });
  }

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private isCacheValid(cached: CachedData<any>): boolean {
    return Date.now() - cached.timestamp < cached.expiresIn;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached)) {
      return cached.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T, customExpiration?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: customExpiration || this.cacheExpiration
    });
    this.saveCacheToStorage();
  }

  private loadCacheFromStorage(): void {
    if (!this.isBrowser) return;
    try {
      const saved = localStorage.getItem('laliga_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.cache = new Map(Object.entries(parsed));
        // Clean expired entries
        this.cache.forEach((value, key) => {
          if (!this.isCacheValid(value)) {
            this.cache.delete(key);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load cache from storage');
    }
  }

  private saveCacheToStorage(): void {
    if (!this.isBrowser) return;
    try {
      const obj: any = {};
      this.cache.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem('laliga_cache', JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save cache to storage');
    }
  }

  private makeRequest<T>(endpoint: string, params?: any): Observable<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.getFromCache<T>(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    this.loadingSubject.next(true);
    this.apiCallsToday++;

    let url = `${this.baseUrl}/${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key].toString());
        }
      });
      url += `?${queryParams.toString()}`;
    }

    return this.http.get<ApiResponse<T>>(url, { headers: this.getHeaders() }).pipe(
      map(response => response.response),
      tap(data => {
        this.setCache(cacheKey, data);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('API Error:', error);
        throw error;
      }),
      shareReplay(1)
    );
  }

  // ==================== MATCHES/FIXTURES ====================
  
  getMatches(round?: string, status?: string): Observable<Match[]> {
    const params: any = {
      league: this.leagueId,
      season: this.season
    };
    if (round) params.round = round;
    if (status) params.status = status;
    
    return this.makeRequest<Match[]>('fixtures', params);
  }

  getRecentMatches(last: number = 10): Observable<Match[]> {
    return this.makeRequest<Match[]>('fixtures', {
      league: this.leagueId,
      season: this.season,
      last
    });
  }

  getUpcomingMatches(next: number = 10): Observable<Match[]> {
    return this.makeRequest<Match[]>('fixtures', {
      league: this.leagueId,
      season: this.season,
      next
    });
  }

  getMatchById(fixtureId: number): Observable<Match[]> {
    return this.makeRequest<Match[]>('fixtures', { id: fixtureId });
  }

  getMatchesByDate(date: string): Observable<Match[]> {
    return this.makeRequest<Match[]>('fixtures', {
      league: this.leagueId,
      season: this.season,
      date
    });
  }

  getMatchesByRound(round: string): Observable<Match[]> {
    return this.makeRequest<Match[]>('fixtures', {
      league: this.leagueId,
      season: this.season,
      round
    });
  }

  getLiveMatches(): Observable<Match[]> {
    return this.makeRequest<Match[]>('fixtures', {
      league: this.leagueId,
      live: 'all'
    });
  }

  // ==================== MATCH DETAILS ====================

  getMatchEvents(fixtureId: number): Observable<MatchEvent[]> {
    return this.makeRequest<any[]>('fixtures/events', { fixture: fixtureId }).pipe(
      map(events => events || [])
    );
  }

  getMatchLineups(fixtureId: number): Observable<Lineup[]> {
    return this.makeRequest<Lineup[]>('fixtures/lineups', { fixture: fixtureId });
  }

  getMatchStatistics(fixtureId: number): Observable<MatchStatistic[]> {
    return this.makeRequest<MatchStatistic[]>('fixtures/statistics', { fixture: fixtureId });
  }

  getMatchPlayers(fixtureId: number): Observable<any[]> {
    return this.makeRequest<any[]>('fixtures/players', { fixture: fixtureId });
  }

  // ==================== STANDINGS ====================

  getStandings(): Observable<Standing[]> {
    return this.makeRequest<StandingsResponse[]>('standings', {
      league: this.leagueId,
      season: this.season
    }).pipe(
      map(response => {
        if (response && response.length > 0 && response[0].league.standings) {
          return response[0].league.standings[0];
        }
        return [];
      })
    );
  }

  // ==================== TEAMS ====================

  getTeams(): Observable<TeamDetails[]> {
    return this.makeRequest<TeamDetails[]>('teams', {
      league: this.leagueId,
      season: this.season
    });
  }

  getTeamById(teamId: number): Observable<TeamDetails[]> {
    return this.makeRequest<TeamDetails[]>('teams', { id: teamId });
  }

  getTeamStatistics(teamId: number): Observable<any> {
    return this.makeRequest<any>('teams/statistics', {
      team: teamId,
      league: this.leagueId,
      season: this.season
    });
  }

  getTeamMatches(teamId: number, last?: number): Observable<Match[]> {
    const params: any = {
      team: teamId,
      league: this.leagueId,
      season: this.season
    };
    if (last) params.last = last;
    return this.makeRequest<Match[]>('fixtures', params);
  }

  // ==================== PLAYERS ====================

  getSquad(teamId: number): Observable<any[]> {
    return this.makeRequest<any[]>('players/squads', { team: teamId });
  }

  getPlayerById(playerId: number): Observable<PlayerStatistics[]> {
    return this.makeRequest<PlayerStatistics[]>('players', {
      id: playerId,
      league: this.leagueId,
      season: this.season
    });
  }

  getPlayersByTeam(teamId: number): Observable<PlayerStatistics[]> {
    return this.makeRequest<PlayerStatistics[]>('players', {
      team: teamId,
      league: this.leagueId,
      season: this.season
    });
  }

  searchPlayers(name: string): Observable<PlayerStatistics[]> {
    return this.makeRequest<PlayerStatistics[]>('players', {
      search: name,
      league: this.leagueId
    });
  }

  // ==================== TOP STATS ====================

  getTopScorers(count: number = 20): Observable<TopScorer[]> {
    return this.makeRequest<TopScorer[]>('players/topscorers', {
      league: this.leagueId,
      season: this.season
    }).pipe(
      map(scorers => scorers.slice(0, count))
    );
  }

  getTopAssists(count: number = 20): Observable<TopScorer[]> {
    return this.makeRequest<TopScorer[]>('players/topassists', {
      league: this.leagueId,
      season: this.season
    }).pipe(
      map(players => players.slice(0, count))
    );
  }

  getTopYellowCards(count: number = 20): Observable<TopScorer[]> {
    return this.makeRequest<TopScorer[]>('players/topyellowcards', {
      league: this.leagueId,
      season: this.season
    }).pipe(
      map(players => players.slice(0, count))
    );
  }

  getTopRedCards(count: number = 20): Observable<TopScorer[]> {
    return this.makeRequest<TopScorer[]>('players/topredcards', {
      league: this.leagueId,
      season: this.season
    }).pipe(
      map(players => players.slice(0, count))
    );
  }

  // ==================== ROUNDS ====================

  getRounds(): Observable<Round[]> {
    return this.makeRequest<Round[]>('fixtures/rounds', {
      league: this.leagueId,
      season: this.season
    });
  }

  getCurrentRound(): Observable<string> {
    return this.makeRequest<string[]>('fixtures/rounds', {
      league: this.leagueId,
      season: this.season,
      current: true
    }).pipe(
      map(rounds => rounds[0] || 'Regular Season - 1')
    );
  }

  // ==================== HEAD TO HEAD ====================

  getHeadToHead(team1: number, team2: number, last: number = 10): Observable<H2H[]> {
    return this.makeRequest<H2H[]>('fixtures/headtohead', {
      h2h: `${team1}-${team2}`,
      last
    });
  }

  // ==================== UTILITY ====================

  getRemainingApiCalls(): number {
    return this.maxDailyCallsFree - this.apiCallsToday;
  }

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem('laliga_cache');
  }

  getCacheStats(): { entries: number; keys: string[] } {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
