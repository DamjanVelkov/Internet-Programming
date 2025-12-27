import { Component, Input } from '@angular/core';
import { DetailEpisode } from '../models/view-models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details {
  @Input()
  episode: DetailEpisode | null = null;
}