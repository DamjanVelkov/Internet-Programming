import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie, Actor } from '../models/movie';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  movie$: Observable<Movie | undefined>;
  allMovies$: Observable<Movie[]>;
  allActors$: Observable<Actor[]>;
  relatedMoviesByGenre: Movie[] = [];
  relatedMoviesByDirector: Movie[] = [];
  relatedMoviesByActor: Movie[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router
  ) {
    this.movie$ = this.route.paramMap.pipe(
      switchMap(params => this.movieService.getMovieById(+params.get('id')!))
    );
    this.allMovies$ = this.movieService.getMovies();
    this.allActors$ = this.movieService.getActors();
  }

  ngOnInit(): void {
    this.movie$.pipe(takeUntil(this.destroy$)).subscribe(movie => {
      if (movie) {
        this.loadRelatedMovies(movie);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRelatedMovies(movie: Movie): void {
    this.allMovies$.pipe(takeUntil(this.destroy$)).subscribe(allMovies => {
      // Movies with same genre
      this.relatedMoviesByGenre = allMovies.filter(m =>
        m.id !== movie.id && m.genre.some(g => movie.genre.includes(g))
      ).sort((a, b) => a.title.localeCompare(b.title));

      // Movies with same director
      this.relatedMoviesByDirector = allMovies.filter(m =>
        m.id !== movie.id && m.director === movie.director
      ).sort((a, b) => a.title.localeCompare(b.title));

      // Movies with same actor
      const actorNames = movie.cast?.map(c => c.actor) || [];
      this.relatedMoviesByActor = allMovies.filter(m =>
        m.id !== movie.id && m.cast?.some(c => actorNames.includes(c.actor))
      ).sort((a, b) => a.title.localeCompare(b.title));
    });
  }

  formatOscarType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }

  getOscarsSorted(oscars: any): string[] {
    return Object.keys(oscars || {}).sort();
  }

  editMovie(id: number): void {
    this.router.navigate(['/movies', id, 'edit']);
  }

  deleteMovie(id: number): void {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(id);
      this.router.navigate(['/movies']);
    }
  }

  addCast(id: number): void {
    this.router.navigate(['/movies', id, 'cast', 'add']);
  }

  viewMovie(id: number): void {
    this.router.navigate(['/movies', id]);
  }

  viewActor(name: string): void {
    this.allActors$.pipe(takeUntil(this.destroy$)).subscribe(actors => {
      const actor = actors.find(a => a.name === name);
      if (actor) {
        this.router.navigate(['/actor', actor.id]);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }
}
