import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Match } from '../../../models/football.models';

@Component({
  selector: 'app-match-card',
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.css']
})
export class MatchCardComponent {
  @Input() match!: Match;
  @Input() showDate: boolean = true;
  @Input() compact: boolean = false;
  @Output() matchClick = new EventEmitter<number>();
  @Output() teamClick = new EventEmitter<number>();

  get formattedDate(): string {
    const date = new Date(this.match.fixture.date);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  get formattedTime(): string {
    const date = new Date(this.match.fixture.date);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  get isFinished(): boolean {
    return this.match.fixture.status.short === 'FT' || 
           this.match.fixture.status.short === 'AET' ||
           this.match.fixture.status.short === 'PEN';
  }

  get isLive(): boolean {
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'];
    return liveStatuses.includes(this.match.fixture.status.short);
  }

  get isScheduled(): boolean {
    return this.match.fixture.status.short === 'NS' || 
           this.match.fixture.status.short === 'TBD';
  }

  get statusText(): string {
    if (this.isLive) {
      if (this.match.fixture.status.elapsed) {
        return `${this.match.fixture.status.elapsed}'`;
      }
      return this.match.fixture.status.short;
    }
    if (this.isFinished) {
      return 'FT';
    }
    return this.formattedTime;
  }

  onMatchClick(): void {
    this.matchClick.emit(this.match.fixture.id);
  }

  onTeamClick(event: Event, teamId: number): void {
    event.stopPropagation();
    this.teamClick.emit(teamId);
  }
}
