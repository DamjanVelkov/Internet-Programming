import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { SofascoreService, Match, MatchLineup, MatchEvent, MatchStatistics, LineupPlayer } from '../../services/sofascore.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-match-detail',
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.css']
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  match: Match | null = null;
  lineups: MatchLineup | null = null;
  incidents: MatchEvent[] = [];
  statistics: MatchStatistics | null = null;
  
  // Coaches fetched from team data
  homeCoach: string | null = null;
  awayCoach: string | null = null;
  
  isLoading = true;
  error: string | null = null;
  activeTab: 'summary' | 'lineups' | 'stats' = 'summary';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private sofascoreService: SofascoreService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const matchId = +params['id'];
        if (matchId) {
          this.loadMatch(matchId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMatch(matchId: number): void {
    this.isLoading = true;
    this.error = null;

    // Load match details and additional data in parallel
    forkJoin({
      match: this.sofascoreService.getMatchDetails(matchId),
      lineups: this.sofascoreService.getMatchLineups(matchId),
      incidents: this.sofascoreService.getMatchIncidents(matchId),
      statistics: this.sofascoreService.getMatchStatistics(matchId)
    })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(data => {
          // If we have match data, fetch team info to get coaches
          if (data.match) {
            return forkJoin({
              homeTeam: this.sofascoreService.getTeam(data.match.homeTeam.id),
              awayTeam: this.sofascoreService.getTeam(data.match.awayTeam.id)
            }).pipe(
              switchMap(teams => of({ ...data, homeTeam: teams.homeTeam, awayTeam: teams.awayTeam }))
            );
          }
          return of({ ...data, homeTeam: null, awayTeam: null });
        })
      )
      .subscribe({
        next: (data) => {
          if (data.match) {
            this.match = data.match;
            this.lineups = data.lineups;
            this.incidents = data.incidents || [];
            this.statistics = data.statistics;
            
            // Get coaches from team data
            this.homeCoach = data.homeTeam?.manager || null;
            this.awayCoach = data.awayTeam?.manager || null;
          } else {
            this.error = 'Match not found';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading match:', err);
          this.error = 'Failed to load match details';
          this.isLoading = false;
        }
      });
  }

  setTab(tab: 'summary' | 'lineups' | 'stats'): void {
    this.activeTab = tab;
  }

  getTeamImageUrl(teamId: number): string {
    return this.sofascoreService.getTeamImageUrl(teamId);
  }

  getPlayerImageUrl(playerId: number): string {
    return this.sofascoreService.getPlayerImageUrl(playerId);
  }

  formatDate(): string {
    if (this.match?.startTimestamp) {
      return new Date(this.match.startTimestamp * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'TBD';
  }

  formatTime(): string {
    if (this.match?.startTimestamp) {
      return new Date(this.match.startTimestamp * 1000).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    return 'TBD';
  }

  getMatchStatus(): string {
    if (!this.match) return '';
    const status = this.match.status?.type;
    if (status === 'finished') return 'Full Time';
    if (status === 'inprogress') return 'Live';
    if (status === 'notstarted') return 'Upcoming';
    return this.match.status?.description || 'TBD';
  }

  isFinished(): boolean {
    return this.match?.status?.type === 'finished';
  }

  // Get goals for display
  getGoals(): MatchEvent[] {
    return this.incidents.filter(e => e.type === 'goal');
  }

  getHomeGoals(): MatchEvent[] {
    return this.getGoals().filter(e => e.team === 'home');
  }

  getAwayGoals(): MatchEvent[] {
    return this.getGoals().filter(e => e.team === 'away');
  }

  // Get cards
  getCards(): MatchEvent[] {
    return this.incidents.filter(e => e.type === 'card');
  }

  // Get substitutions
  getSubstitutions(): MatchEvent[] {
    return this.incidents.filter(e => e.type === 'substitution');
  }

  // Get substitutes who came on during the match
  getUsedSubstitutes(team: 'home' | 'away'): LineupPlayer[] {
    if (!this.lineups) return [];
    
    const substitutes = team === 'home' ? this.lineups.home.substitutes : this.lineups.away.substitutes;
    const subs = this.getSubstitutions().filter(e => e.team === team);
    
    // Get IDs of players who came on
    const usedIds = new Set(subs.map(s => s.playerIn?.id).filter(id => id !== undefined));
    
    return substitutes.filter(p => usedIds.has(p.id));
  }

  // Get substitutes who didn't play
  getUnusedSubstitutes(team: 'home' | 'away'): LineupPlayer[] {
    if (!this.lineups) return [];
    
    const substitutes = team === 'home' ? this.lineups.home.substitutes : this.lineups.away.substitutes;
    const subs = this.getSubstitutions().filter(e => e.team === team);
    
    // Get IDs of players who came on
    const usedIds = new Set(subs.map(s => s.playerIn?.id).filter(id => id !== undefined));
    
    return substitutes.filter(p => !usedIds.has(p.id));
  }

  // Get sorted substitutes (used first, then unused)
  getSortedSubstitutes(team: 'home' | 'away'): LineupPlayer[] {
    const used = this.getUsedSubstitutes(team);
    const unused = this.getUnusedSubstitutes(team);
    return [...used, ...unused];
  }

  // Check if a substitute was used
  isSubUsed(playerId: number, team: 'home' | 'away'): boolean {
    const subs = this.getSubstitutions().filter(e => e.team === team);
    return subs.some(s => s.playerIn?.id === playerId);
  }

  // Get the minute a substitute came on
  getSubMinute(playerId: number, team: 'home' | 'away'): string {
    const sub = this.getSubstitutions().find(s => s.team === team && s.playerIn?.id === playerId);
    if (sub) {
      return this.formatEventTime(sub);
    }
    return '';
  }

  // Format event time
  formatEventTime(event: MatchEvent): string {
    // Skip events with invalid/negative time
    if (event.time < 0) {
      return '';
    }
    if (event.addedTime && event.addedTime > 0) {
      return `${event.time}'+${event.addedTime}`;
    }
    return `${event.time}'`;
  }

  // Calculate player X position on field based on formation
  getPlayerX(player: any, team: 'home' | 'away'): number {
    if (!this.lineups) return 50;
    
    const formation = team === 'home' ? this.lineups.home.formation : this.lineups.away.formation;
    const players = team === 'home' ? this.lineups.home.players : this.lineups.away.players;
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (playerIndex === -1) return 50;
    
    // Parse formation (e.g., "4-3-3" -> [4, 3, 3])
    const lines = formation?.split('-').map(n => parseInt(n)) || [4, 4, 2];
    
    // Goalkeeper is always center
    if (playerIndex === 0) return 50;
    
    // Calculate which line the player is in
    let currentLine = 0;
    let posInLine = playerIndex - 1; // -1 for goalkeeper
    let playersInLine = lines[0] || 4;
    
    for (let i = 0; i < lines.length; i++) {
      if (posInLine < lines[i]) {
        currentLine = i;
        playersInLine = lines[i];
        break;
      }
      posInLine -= lines[i];
    }
    
    // Distribute players evenly across the width
    const spacing = 80 / (playersInLine + 1);
    return 10 + spacing * (posInLine + 1);
  }

  // Calculate player Y position on field
  getPlayerY(player: any, team: 'home' | 'away'): number {
    if (!this.lineups) return 50;
    
    const formation = team === 'home' ? this.lineups.home.formation : this.lineups.away.formation;
    const players = team === 'home' ? this.lineups.home.players : this.lineups.away.players;
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (playerIndex === -1) return 50;
    
    // Parse formation
    const lines = formation?.split('-').map(n => parseInt(n)) || [4, 4, 2];
    const totalLines = lines.length + 1; // +1 for goalkeeper
    
    // Goalkeeper
    if (playerIndex === 0) {
      return team === 'home' ? 92 : 8;
    }
    
    // Find which line the player is in
    let currentLine = 0;
    let posInLine = playerIndex - 1;
    
    for (let i = 0; i < lines.length; i++) {
      if (posInLine < lines[i]) {
        currentLine = i + 1; // +1 because line 0 is goalkeeper
        break;
      }
      posInLine -= lines[i];
    }
    
    // Calculate Y position (home team bottom half, away team top half)
    const lineSpacing = 40 / totalLines;
    if (team === 'home') {
      return 52 + lineSpacing * (totalLines - currentLine);
    } else {
      return 48 - lineSpacing * (totalLines - currentLine);
    }
  }

  onTeamClick(teamId: number): void {
    this.router.navigate(['/team', teamId]);
  }

  onPlayerClick(playerId: number): void {
    this.router.navigate(['/player', playerId]);
  }

  goBack(): void {
    this.location.back();
  }
}
