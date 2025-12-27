import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Movie, Actor, MovieData } from '../models/movie';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private dataUrl = 'assets/db/movie-data.json';
  private moviesSubject = new BehaviorSubject<Movie[]>([]);
  private actorsSubject = new BehaviorSubject<Actor[]>([]);
  private genresSubject = new BehaviorSubject<string[]>([]);

  public movies$ = this.moviesSubject.asObservable();
  public actors$ = this.actorsSubject.asObservable();
  public genres$ = this.genresSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadData();
  }

  private loadData(): void {
    this.http.get<MovieData>(this.dataUrl).subscribe(data => {
      this.moviesSubject.next(data.movies);
      this.actorsSubject.next(data.actors);
      this.genresSubject.next(data.genres);
    });
  }

  getMovies(): Observable<Movie[]> {
    return this.movies$;
  }

  getActors(): Observable<Actor[]> {
    return this.actors$;
  }

  getGenres(): Observable<string[]> {
    return this.genres$;
  }

  getMovieById(id: number): Observable<Movie | undefined> {
    return this.movies$.pipe(
      map(movies => movies.find(m => m.id === id))
    );
  }

  getActorById(id: number): Observable<Actor | undefined> {
    return this.actors$.pipe(
      map(actors => actors.find(a => a.id === id))
    );
  }

  getActorByName(name: string): Observable<Actor | undefined> {
    return this.actors$.pipe(
      map(actors => actors.find(a => a.name === name))
    );
  }

  addMovie(movie: Movie): void {
    const movies = this.moviesSubject.value;
    const maxId = Math.max(...movies.map(m => m.id), 0);
    movie.id = maxId + 1;
    this.moviesSubject.next([...movies, movie]);
  }

  updateMovie(id: number, movie: Partial<Movie>): void {
    const movies = this.moviesSubject.value;
    const index = movies.findIndex(m => m.id === id);
    if (index !== -1) {
      movies[index] = { ...movies[index], ...movie, id };
      this.moviesSubject.next([...movies]);
    }
  }

  deleteMovie(id: number): void {
    const movies = this.moviesSubject.value.filter(m => m.id !== id);
    this.moviesSubject.next(movies);
  }

  addCastMember(movieId: number, actor: string, character: string): void {
    const movies = this.moviesSubject.value;
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      if (!movie.cast) {
        movie.cast = [];
      }
      movie.cast.push({ actor, character });
      this.moviesSubject.next([...movies]);
    }
  }
}
