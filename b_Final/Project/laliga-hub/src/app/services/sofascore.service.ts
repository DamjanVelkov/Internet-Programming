import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, catchError, tap, shareReplay, switchMap } from 'rxjs/operators';

// La Liga tournament ID in SofaScore
const LA_LIGA_ID = 8;

// Season IDs for La Liga in SofaScore
export interface SeasonInfo {
  id: number;
  name: string;
  year: string;
  displayName: string;
}

export const SEASONS: SeasonInfo[] = [
  { id: 77559, name: 'LaLiga 25/26', year: '25/26', displayName: '2025/26' },
  { id: 61643, name: 'LaLiga 24/25', year: '24/25', displayName: '2024/25' },
  { id: 52376, name: 'LaLiga 23/24', year: '23/24', displayName: '2023/24' },
  { id: 42409, name: 'LaLiga 22/23', year: '22/23', displayName: '2022/23' },
  { id: 37223, name: 'LaLiga 21/22', year: '21/22', displayName: '2021/22' },
  { id: 32501, name: 'LaLiga 20/21', year: '20/21', displayName: '2020/21' },
  { id: 24127, name: 'LaLiga 19/20', year: '19/20', displayName: '2019/20' },
];

// The actual current season for which squad data is available
// This is 2024/25 since we're in Dec 2024 and that's the active season
export const ACTUAL_CURRENT_SEASON_ID = 61643;

export interface Standing {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    slug: string;
  };
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
  goalDifference: number;
}

export interface Match {
  id: number;
  slug: string;
  round: number;
  status: {
    code: number;
    description: string;
    type: string;
  };
  startTimestamp: number;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    slug: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    slug: string;
  };
  homeScore: {
    current: number;
    display: number;
    period1?: number;
    period2?: number;
  };
  awayScore: {
    current: number;
    display: number;
    period1?: number;
    period2?: number;
  };
  winnerCode?: number;
  tournament?: {
    uniqueTournament?: {
      id: number;
    };
  };
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  slug: string;
  stadium?: string;
  manager?: string;
  founded?: number;
}

export interface Player {
  id: number;
  name: string;
  shortName: string;
  slug: string;
  position: string;
  jerseyNumber?: string;
  height?: number;
  dateOfBirthTimestamp?: number;
  country?: {
    name: string;
    alpha2?: string;
  };
  team?: {
    id: number;
    name: string;
    shortName: string;
  };
}

export interface TopPlayer {
  player: Player;
  statistics: {
    goals?: number;
    assists?: number;
    rating?: number;
    appearances?: number;
    yellowCards?: number;
    redCards?: number;
  };
  team: {
    id: number;
    name: string;
    shortName: string;
  };
}

// Match Event (goal, card, substitution)
export interface MatchEvent {
  id: number;
  type: string; // 'goal', 'card', 'substitution', 'var'
  time: number;
  addedTime?: number;
  team: 'home' | 'away';
  player?: {
    id: number;
    name: string;
    shortName: string;
  };
  assist?: {
    id: number;
    name: string;
    shortName: string;
  };
  playerIn?: {
    id: number;
    name: string;
    shortName: string;
  };
  playerOut?: {
    id: number;
    name: string;
    shortName: string;
  };
  isOwnGoal?: boolean;
  isPenalty?: boolean;
  cardType?: 'yellow' | 'red' | 'yellowred';
}

// Match Lineup
export interface MatchLineup {
  home: {
    formation: string;
    coach?: { id: number; name: string; shortName: string };
    players: LineupPlayer[];
    substitutes: LineupPlayer[];
  };
  away: {
    formation: string;
    coach?: { id: number; name: string; shortName: string };
    players: LineupPlayer[];
    substitutes: LineupPlayer[];
  };
}

export interface LineupPlayer {
  id: number;
  name: string;
  shortName: string;
  jerseyNumber: string;
  position: string;
  substitute?: boolean;
  rating?: string;
  // Grid position for field visualization (0-100 scale)
  positionX?: number;
  positionY?: number;
}

// Match Statistics
export interface MatchStatistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
}

@Injectable({
  providedIn: 'root'
})
export class SofascoreService {
  private readonly API_BASE = 'https://api.sofascore.com/api/v1';
  private readonly IMG_BASE = 'https://img.sofascore.com/api/v1';
  
  private currentSeasonSubject = new BehaviorSubject<SeasonInfo>(SEASONS[0]);
  currentSeason$ = this.currentSeasonSubject.asObservable();
  
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  // Get current season
  getCurrentSeason(): SeasonInfo {
    return this.currentSeasonSubject.getValue();
  }

  // Set current season
  setCurrentSeason(season: SeasonInfo): void {
    this.currentSeasonSubject.next(season);
    this.clearCache();
  }

  // Get all available seasons
  getSeasons(): SeasonInfo[] {
    return SEASONS;
  }

  // Check if it's the current/latest season
  isCurrentSeason(): boolean {
    return this.currentSeasonSubject.getValue().id === SEASONS[0].id;
  }

  // Store LaLiga team IDs
  private laLigaTeamIds: Set<number> = new Set();

  // Check if team is in LaLiga
  isLaLigaTeam(teamId: number): Observable<boolean> {
    // If we already have cached team IDs
    if (this.laLigaTeamIds.size > 0) {
      return of(this.laLigaTeamIds.has(teamId));
    }

    // Fetch standings to get LaLiga team IDs
    return this.getStandings().pipe(
      map(standings => {
        standings.forEach(s => this.laLigaTeamIds.add(s.team.id));
        return this.laLigaTeamIds.has(teamId);
      })
    );
  }

  // Sync check if team is in LaLiga (must populate first)
  isLaLigaTeamSync(teamId: number): boolean {
    return this.laLigaTeamIds.has(teamId);
  }

  // Populate LaLiga teams cache
  populateLaLigaTeams(): void {
    this.getStandings().subscribe(standings => {
      standings.forEach(s => this.laLigaTeamIds.add(s.team.id));
    });
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cached or fetch
  private getCachedOrFetch<T>(key: string, fetcher: () => Observable<T>): Observable<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(cached.data as T);
    }
    
    return fetcher().pipe(
      tap(data => this.cache.set(key, { data, timestamp: Date.now() }))
    );
  }

  // Get team image URL
  getTeamImageUrl(teamId: number): string {
    return `${this.IMG_BASE}/team/${teamId}/image`;
  }

  // Get player image URL
  getPlayerImageUrl(playerId: number): string {
    return `${this.IMG_BASE}/player/${playerId}/image`;
  }

  // Get league image URL
  getLeagueImageUrl(): string {
    return `${this.IMG_BASE}/unique-tournament/${LA_LIGA_ID}/image`;
  }

  // Get standings
  getStandings(seasonId?: number): Observable<Standing[]> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `standings-${season}`;
    
    return this.getCachedOrFetch(cacheKey, () => 
      this.http.get<any>(`${this.API_BASE}/unique-tournament/${LA_LIGA_ID}/season/${season}/standings/total`)
        .pipe(
          map(response => {
            if (!response?.standings?.[0]?.rows) {
              return [];
            }
            return response.standings[0].rows.map((row: any) => ({
              position: row.position,
              team: {
                id: row.team.id,
                name: row.team.name,
                shortName: row.team.shortName || row.team.name,
                slug: row.team.slug
              },
              matches: row.matches || 0,
              wins: row.wins || 0,
              draws: row.draws || 0,
              losses: row.losses || 0,
              scoresFor: row.scoresFor || 0,
              scoresAgainst: row.scoresAgainst || 0,
              points: row.points || 0,
              goalDifference: (row.scoresFor || 0) - (row.scoresAgainst || 0)
            }));
          }),
          catchError(err => {
            console.error('Error fetching standings:', err);
            return of([]);
          })
        )
    );
  }

  // Get rounds info
  getRounds(seasonId?: number): Observable<{ currentRound: number; rounds: number[] }> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `rounds-${season}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/unique-tournament/${LA_LIGA_ID}/season/${season}/rounds`)
        .pipe(
          map(response => {
            const currentRound = response?.currentRound?.round || 1;
            const rounds = response?.rounds?.map((r: any) => r.round) || [];
            return { currentRound, rounds };
          }),
          catchError(err => {
            console.error('Error fetching rounds:', err);
            return of({ currentRound: 1, rounds: [] });
          })
        )
    );
  }

  // Get matches by round
  getMatchesByRound(round: number, seasonId?: number): Observable<Match[]> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `matches-round-${season}-${round}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/unique-tournament/${LA_LIGA_ID}/season/${season}/events/round/${round}`)
        .pipe(
          map(response => this.mapMatches(response?.events || [], round)),
          catchError(err => {
            console.error(`Error fetching matches for round ${round}:`, err);
            return of([]);
          })
        )
    );
  }

  // Get recent and upcoming matches (last few rounds + upcoming)
  getRecentMatches(seasonId?: number): Observable<Match[]> {
    const season = seasonId || this.getCurrentSeason().id;
    
    return this.getRounds(season).pipe(
      map(roundsInfo => {
        const current = roundsInfo.currentRound;
        // Get 2 rounds before and 2 after current
        const startRound = Math.max(1, current - 2);
        const endRound = Math.min(38, current + 2);
        return Array.from({ length: endRound - startRound + 1 }, (_, i) => startRound + i);
      }),
      map(rounds => {
        const requests = rounds.map(round => this.getMatchesByRound(round, season));
        return forkJoin(requests);
      }),
      map(requestsObs => {
        // Return a flattened observable
        return requestsObs;
      }),
      catchError(err => {
        console.error('Error fetching recent matches:', err);
        return of(of([]));
      })
    ) as unknown as Observable<Match[]>;
  }

  // Get last fixtures for the league (sorted by date, most recent first)
  getLastFixtures(seasonId?: number): Observable<Match[]> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `last-fixtures-${season}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/unique-tournament/${LA_LIGA_ID}/season/${season}/events/last/0`)
        .pipe(
          map(response => {
            const matches = this.mapMatches(response?.events || []);
            // Sort by timestamp descending (most recent first) and return finished matches only
            return matches
              .filter(m => m.status?.type === 'finished')
              .sort((a, b) => (b.startTimestamp || 0) - (a.startTimestamp || 0));
          }),
          catchError(err => {
            console.error('Error fetching last fixtures:', err);
            return of([]);
          })
        )
    );
  }

  // Get next fixtures for the league
  getNextFixtures(seasonId?: number): Observable<Match[]> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `next-fixtures-${season}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/unique-tournament/${LA_LIGA_ID}/season/${season}/events/next/0`)
        .pipe(
          map(response => this.mapMatches(response?.events || [])),
          catchError(err => {
            console.error('Error fetching next fixtures:', err);
            return of([]);
          })
        )
    );
  }

  // Get top players (scorers, assists, etc.)
  getTopPlayers(seasonId?: number): Observable<{ scorers: TopPlayer[]; assists: TopPlayer[]; rating: TopPlayer[] }> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `top-players-${season}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/unique-tournament/${LA_LIGA_ID}/season/${season}/top-players/overall`)
        .pipe(
          map(response => {
            const topPlayers = response?.topPlayers || {};
            return {
              scorers: this.mapTopPlayers(topPlayers.goals || [], 'goals'),
              assists: this.mapTopPlayers(topPlayers.assists || [], 'assists'),
              rating: this.mapTopPlayers(topPlayers.rating || [], 'rating')
            };
          }),
          catchError(err => {
            console.error('Error fetching top players:', err);
            return of({ scorers: [], assists: [], rating: [] });
          })
        )
    );
  }

  // Get team details
  getTeam(teamId: number): Observable<Team | null> {
    const cacheKey = `team-${teamId}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/team/${teamId}`)
        .pipe(
          map(response => {
            if (!response?.team) return null;
            const team = response.team;
            return {
              id: team.id,
              name: team.name,
              shortName: team.shortName || team.name,
              slug: team.slug,
              stadium: team.venue?.stadium?.name || team.venue?.city?.name,
              manager: team.manager?.name,
              founded: team.foundationDateTimestamp ? new Date(team.foundationDateTimestamp * 1000).getFullYear() : undefined
            };
          }),
          catchError(err => {
            console.error(`Error fetching team ${teamId}:`, err);
            return of(null);
          })
        )
    );
  }

  // Get team squad
  getTeamSquad(teamId: number): Observable<Player[]> {
    const cacheKey = `squad-${teamId}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/team/${teamId}/players`)
        .pipe(
          map(response => {
            if (!response?.players) return [];
            return response.players.map((p: any) => ({
              id: p.player.id,
              name: p.player.name,
              shortName: p.player.shortName || p.player.name,
              slug: p.player.slug,
              position: p.player.position || 'Unknown',
              jerseyNumber: p.player.jerseyNumber,
              height: p.player.height,
              dateOfBirthTimestamp: p.player.dateOfBirthTimestamp
            }));
          }),
          catchError(err => {
            console.error(`Error fetching squad for team ${teamId}:`, err);
            return of([]);
          })
        )
    );
  }

  // Get ALL team's matches for a season (past + future)
  getTeamMatches(teamId: number, seasonId?: number): Observable<Match[]> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `team-all-matches-${teamId}-${season}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      // Fetch all rounds for the season
      this.getRounds(season).pipe(
        switchMap(roundsInfo => {
          // Fetch all 38 rounds
          const allRounds = Array.from({ length: 38 }, (_, i) => i + 1);
          const roundRequests = allRounds.map(round => 
            this.getMatchesByRound(round, season).pipe(
              catchError(() => of([]))
            )
          );
          return forkJoin(roundRequests);
        }),
        map(allRoundMatches => {
          // Flatten all matches
          const allMatches = allRoundMatches.flat();
          // Filter to only matches involving this team
          return allMatches.filter((match: Match) => 
            match.homeTeam?.id === teamId || match.awayTeam?.id === teamId
          );
        }),
        catchError(err => {
          console.error(`Error fetching all matches for team ${teamId}:`, err);
          return of([]);
        })
      )
    );
  }

  // Get player details
  getPlayer(playerId: number): Observable<Player | null> {
    const cacheKey = `player-${playerId}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/player/${playerId}`)
        .pipe(
          map(response => {
            if (!response?.player) return null;
            const player = response.player;
            return {
              id: player.id,
              name: player.name,
              shortName: player.shortName || player.name,
              slug: player.slug,
              position: player.position || 'Unknown',
              jerseyNumber: player.jerseyNumber,
              height: player.height,
              dateOfBirthTimestamp: player.dateOfBirthTimestamp,
              country: player.country ? {
                name: player.country.name,
                alpha2: player.country.alpha2
              } : undefined,
              team: player.team ? {
                id: player.team.id,
                name: player.team.name,
                shortName: player.team.shortName || player.team.name
              } : undefined
            };
          }),
          catchError(err => {
            console.error(`Error fetching player ${playerId}:`, err);
            return of(null);
          })
        )
    );
  }

  // Get player statistics
  getPlayerStats(playerId: number, seasonId?: number): Observable<any> {
    const season = seasonId || this.getCurrentSeason().id;
    const cacheKey = `player-stats-${playerId}-${season}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/player/${playerId}/unique-tournament/${LA_LIGA_ID}/season/${season}/statistics/overall`)
        .pipe(
          map(response => response?.statistics || null),
          catchError(err => {
            console.error(`Error fetching stats for player ${playerId}:`, err);
            return of(null);
          })
        )
    );
  }

  // Get match details
  getMatch(matchId: number): Observable<Match | null> {
    const cacheKey = `match-${matchId}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/event/${matchId}`)
        .pipe(
          map(response => {
            if (!response?.event) return null;
            const event = response.event;
            return this.mapMatch(event);
          }),
          catchError(err => {
            console.error(`Error fetching match ${matchId}:`, err);
            return of(null);
          })
        )
    );
  }

  // Alias for getMatch
  getMatchDetails(matchId: number): Observable<Match | null> {
    return this.getMatch(matchId);
  }

  // Map matches from API response
  private mapMatches(events: any[], roundOverride?: number): Match[] {
    return events.map(event => this.mapMatch(event, roundOverride));
  }

  private mapMatch(event: any, roundOverride?: number): Match {
    return {
      id: event.id,
      slug: event.slug || '',
      round: roundOverride || event.roundInfo?.round || 0,
      status: {
        code: event.status?.code || 0,
        description: event.status?.description || 'Unknown',
        type: event.status?.type || 'unknown'
      },
      startTimestamp: event.startTimestamp || 0,
      homeTeam: {
        id: event.homeTeam?.id || 0,
        name: event.homeTeam?.name || 'Unknown',
        shortName: event.homeTeam?.shortName || event.homeTeam?.name || 'Unknown',
        slug: event.homeTeam?.slug || ''
      },
      awayTeam: {
        id: event.awayTeam?.id || 0,
        name: event.awayTeam?.name || 'Unknown',
        shortName: event.awayTeam?.shortName || event.awayTeam?.name || 'Unknown',
        slug: event.awayTeam?.slug || ''
      },
      homeScore: {
        current: event.homeScore?.current ?? 0,
        display: event.homeScore?.display ?? event.homeScore?.current ?? 0,
        period1: event.homeScore?.period1,
        period2: event.homeScore?.period2
      },
      awayScore: {
        current: event.awayScore?.current ?? 0,
        display: event.awayScore?.display ?? event.awayScore?.current ?? 0,
        period1: event.awayScore?.period1,
        period2: event.awayScore?.period2
      },
      winnerCode: event.winnerCode,
      tournament: event.tournament ? {
        uniqueTournament: event.tournament.uniqueTournament ? {
          id: event.tournament.uniqueTournament.id
        } : undefined
      } : undefined
    };
  }

  // Map top players from API response
  private mapTopPlayers(players: any[], statType: string): TopPlayer[] {
    return players.slice(0, 20).map((item: any) => ({
      player: {
        id: item.player?.id || 0,
        name: item.player?.name || 'Unknown',
        shortName: item.player?.shortName || item.player?.name || 'Unknown',
        slug: item.player?.slug || '',
        position: item.player?.position || 'Unknown',
        jerseyNumber: item.player?.jerseyNumber
      },
      statistics: {
        goals: statType === 'goals' ? item.statistics?.goals : undefined,
        assists: statType === 'assists' ? item.statistics?.assists : undefined,
        rating: statType === 'rating' ? item.statistics?.rating : undefined,
        appearances: item.statistics?.appearances
      },
      team: {
        id: item.team?.id || 0,
        name: item.team?.name || 'Unknown',
        shortName: item.team?.shortName || item.team?.name || 'Unknown'
      }
    }));
  }

  // Get match lineups
  getMatchLineups(matchId: number): Observable<MatchLineup | null> {
    const cacheKey = `match-lineups-${matchId}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      forkJoin({
        lineups: this.http.get<any>(`${this.API_BASE}/event/${matchId}/lineups`),
        event: this.http.get<any>(`${this.API_BASE}/event/${matchId}`)
      }).pipe(
          map(({ lineups: response, event: eventResponse }) => {
            if (!response?.home || !response?.away) return null;
            
            // Get managers from event data
            const homeManager = eventResponse?.event?.homeTeam?.manager;
            const awayManager = eventResponse?.event?.awayTeam?.manager;
            
            const mapPlayers = (players: any[], isSubstitute: boolean = false): LineupPlayer[] => {
              return (players || []).map((p: any) => ({
                id: p.player?.id || 0,
                name: p.player?.name || 'Unknown',
                shortName: p.player?.shortName || p.player?.name || 'Unknown',
                jerseyNumber: p.player?.jerseyNumber || p.shirtNumber?.toString() || '',
                position: p.position || p.player?.position || '',
                substitute: p.substitute ?? isSubstitute,
                rating: p.statistics?.rating?.toFixed(1),
                positionX: p.position ? (typeof p.position === 'string' && p.position.includes(',') 
                  ? parseInt(p.position.split(',')[1]) * 25 
                  : (parseInt(p.position?.toString().slice(-1)) || 0) * 25) : undefined,
                positionY: p.position ? (typeof p.position === 'string' && p.position.includes(',') 
                  ? parseInt(p.position.split(',')[0]) * 20 
                  : Math.floor(parseInt(p.position?.toString()) / 10) * 20) : undefined
              }));
            };

            const mapAndSplitPlayers = (allPlayers: any[]): { starters: LineupPlayer[]; subs: LineupPlayer[] } => {
              const mapped = mapPlayers(allPlayers);
              const starters = mapped.filter((p, idx) => !p.substitute && idx < 11);
              const subs = mapped.filter((p, idx) => p.substitute || idx >= 11);
              return { starters, subs };
            };

            const homeHasSubs = response.home.substitutes && response.home.substitutes.length > 0;
            const awayHasSubs = response.away.substitutes && response.away.substitutes.length > 0;

            let homeResult, awayResult;

            if (homeHasSubs) {
              homeResult = {
                players: mapPlayers(response.home.players),
                substitutes: mapPlayers(response.home.substitutes, true)
              };
            } else {
              const split = mapAndSplitPlayers(response.home.players);
              homeResult = {
                players: split.starters,
                substitutes: split.subs
              };
            }

            if (awayHasSubs) {
              awayResult = {
                players: mapPlayers(response.away.players),
                substitutes: mapPlayers(response.away.substitutes, true)
              };
            } else {
              const split = mapAndSplitPlayers(response.away.players);
              awayResult = {
                players: split.starters,
                substitutes: split.subs
              };
            }

            return {
              home: {
                formation: response.home.formation || '',
                coach: homeManager ? {
                  id: homeManager.id || 0,
                  name: homeManager.name || 'Unknown',
                  shortName: homeManager.shortName || homeManager.name || 'Unknown'
                } : undefined,
                players: homeResult.players,
                substitutes: homeResult.substitutes
              },
              away: {
                formation: response.away.formation || '',
                coach: awayManager ? {
                  id: awayManager.id || 0,
                  name: awayManager.name || 'Unknown',
                  shortName: awayManager.shortName || awayManager.name || 'Unknown'
                } : undefined,
                players: awayResult.players,
                substitutes: awayResult.substitutes
              }
            };
          }),
          catchError(err => {
            console.error(`Error fetching lineups for match ${matchId}:`, err);
            return of(null);
          })
        )
    );
  }

  // Get match incidents/events (goals, cards, substitutions)
  getMatchIncidents(matchId: number): Observable<MatchEvent[]> {
    const cacheKey = `match-incidents-${matchId}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/event/${matchId}/incidents`)
        .pipe(
          map(response => {
            const incidents = response?.incidents || [];
            return incidents
              .filter((inc: any) => ['goal', 'card', 'substitution', 'period'].includes(inc.incidentType))
              .map((inc: any) => {
                const isHome = inc.isHome ?? (inc.incidentClass === 'home');
                
                const event: MatchEvent = {
                  id: inc.id || 0,
                  type: inc.incidentType,
                  time: inc.time || 0,
                  addedTime: inc.addedTime,
                  team: isHome ? 'home' : 'away',
                };

                if (inc.incidentType === 'goal') {
                  event.player = inc.player ? {
                    id: inc.player.id,
                    name: inc.player.name,
                    shortName: inc.player.shortName || inc.player.name
                  } : undefined;
                  event.assist = inc.assist1 ? {
                    id: inc.assist1.id,
                    name: inc.assist1.name,
                    shortName: inc.assist1.shortName || inc.assist1.name
                  } : undefined;
                  event.isOwnGoal = inc.incidentClass === 'ownGoal';
                  event.isPenalty = inc.incidentClass === 'penalty';
                }

                if (inc.incidentType === 'card') {
                  event.player = inc.player ? {
                    id: inc.player.id,
                    name: inc.player.name,
                    shortName: inc.player.shortName || inc.player.name
                  } : undefined;
                  event.cardType = inc.incidentClass === 'yellow' ? 'yellow' : 
                                   inc.incidentClass === 'red' ? 'red' : 'yellowred';
                }

                if (inc.incidentType === 'substitution') {
                  event.playerIn = inc.playerIn ? {
                    id: inc.playerIn.id,
                    name: inc.playerIn.name,
                    shortName: inc.playerIn.shortName || inc.playerIn.name
                  } : undefined;
                  event.playerOut = inc.playerOut ? {
                    id: inc.playerOut.id,
                    name: inc.playerOut.name,
                    shortName: inc.playerOut.shortName || inc.playerOut.name
                  } : undefined;
                }

                return event;
              })
              .filter((e: MatchEvent) => e.type !== 'period' && e.time >= 0);
          }),
          catchError(err => {
            console.error(`Error fetching incidents for match ${matchId}:`, err);
            return of([]);
          })
        )
    );
  }

  // Get match statistics
  getMatchStatistics(matchId: number): Observable<MatchStatistics | null> {
    const cacheKey = `match-stats-${matchId}`;
    
    return this.getCachedOrFetch(cacheKey, () =>
      this.http.get<any>(`${this.API_BASE}/event/${matchId}/statistics`)
        .pipe(
          map(response => {
            const allStats = response?.statistics?.[0]?.groups || [];
            
            const findStat = (name: string): { home: number; away: number } => {
              for (const group of allStats) {
                const stat = group.statisticsItems?.find((s: any) => 
                  s.name?.toLowerCase().includes(name.toLowerCase())
                );
                if (stat) {
                  return {
                    home: parseInt(stat.home) || 0,
                    away: parseInt(stat.away) || 0
                  };
                }
              }
              return { home: 0, away: 0 };
            };

            return {
              possession: findStat('possession'),
              shots: findStat('total shots'),
              shotsOnTarget: findStat('shots on target'),
              corners: findStat('corner'),
              fouls: findStat('fouls'),
              yellowCards: findStat('yellow'),
              redCards: findStat('red'),
              offsides: findStat('offside'),
              passes: findStat('passes'),
              passAccuracy: findStat('pass accuracy')
            };
          }),
          catchError(err => {
            console.error(`Error fetching statistics for match ${matchId}:`, err);
            return of(null);
          })
        )
    );
  }
}
