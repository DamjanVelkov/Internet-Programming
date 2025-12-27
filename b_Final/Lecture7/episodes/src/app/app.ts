import { Component, signal } from '@angular/core';
import { ListComponent } from "./list.component";
import { episodesData } from './data/episodes';
import { DetailEpisode, toDetailEpisode, toListEpisode } from './models/view-models';
import { Details } from "./details/details";
import { Filter, FilterCriteria } from "./filter/filter";

@Component({
  selector: 'app-root',
  imports: [ListComponent, Details, Filter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  episodes = episodesData;
  selectedEpisode: Episode | null = null;
  detailedEpisode: DetailEpisode | null = null;

  listedEpisodes = this.episodes.map(toListEpisode);

  changeSelected(rank: number) {
    this.selectedEpisode = this.episodes.find(e => e.rank === rank) || null;
    this.detailedEpisode = toDetailEpisode(this.selectedEpisode);
  }

  runFilter(criteria: FilterCriteria) {
    this.listedEpisodes = this.episodes
      .map(toListEpisode)
      .filter(ep => ep.era === criteria.era || !criteria.era);

    if (this.selectedEpisode) {
      const stillListed = this.listedEpisodes.find(e => e.rank === this.selectedEpisode!.rank);
      if (!stillListed) {
        this.selectedEpisode = null;
        this.detailedEpisode = null;
      }
    }
  }

}