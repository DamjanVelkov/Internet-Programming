import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Episode } from './episode.model';

type EpisodesFile = { episodes: Episode[] };

@Injectable({
  providedIn: 'root'
})
export class EpisodesService {

  constructor(private http: HttpClient) { }

  getAll() : Observable<Episode[]> {
    return this.http
      .get<EpisodesFile>('assets/doctor-who-episodes.json')
      .pipe(
        map(res => res.episodes)
      );
  }

  getOne(id: number) : Observable<Episode | undefined> {
    return this.getAll().pipe(
      map(episodes => episodes.find(ep => ep.id === id))
    );
  }
}
