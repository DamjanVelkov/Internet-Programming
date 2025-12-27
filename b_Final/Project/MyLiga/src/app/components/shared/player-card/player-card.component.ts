import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Player, PlayerStatistics } from '../../../models/football.models';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.css']
})
export class PlayerCardComponent {
  @Input() player!: Player | any;
  @Input() stats?: PlayerStatistics;
  @Input() showStats: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() clickable: boolean = true;
  @Output() playerClick = new EventEmitter<number>();

  get playerPhoto(): string {
    return this.player?.photo || 'assets/player-placeholder.png';
  }

  get playerName(): string {
    if (this.player?.firstname && this.player?.lastname) {
      return `${this.player.firstname} ${this.player.lastname}`;
    }
    return this.player?.name || 'Unknown';
  }

  get position(): string {
    const pos = this.player?.pos || this.stats?.statistics?.[0]?.games?.position || '';
    const posMap: { [key: string]: string } = {
      'G': 'Goalkeeper',
      'D': 'Defender',
      'M': 'Midfielder',
      'F': 'Forward',
      'Goalkeeper': 'GK',
      'Defender': 'DEF',
      'Midfielder': 'MID',
      'Attacker': 'FWD'
    };
    return posMap[pos] || pos;
  }

  get jerseyNumber(): number | null {
    return this.player?.number || this.stats?.statistics?.[0]?.games?.number || null;
  }

  get goals(): number {
    return this.stats?.statistics?.[0]?.goals?.total || 0;
  }

  get assists(): number {
    return this.stats?.statistics?.[0]?.goals?.assists || 0;
  }

  onClick(): void {
    if (this.clickable && this.player?.id) {
      this.playerClick.emit(this.player.id);
    }
  }
}
