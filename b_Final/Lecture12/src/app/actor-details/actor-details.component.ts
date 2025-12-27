import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Actor, Movie } from '../models/movie';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-actor-details',
  templateUrl: './actor-details.component.html',
  styleUrl: './actor-details.component.css'
})
export class ActorDetailsComponent implements OnInit {
  actor$: Observable<Actor | undefined>;
  notableMovies: Movie[] = [];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router
  ) {
    this.actor$ = this.route.paramMap.pipe(
      switchMap(params => this.movieService.getActorById(+params.get('id')!))
    );
  }

  ngOnInit(): void {
    this.actor$.subscribe(actor => {
      if (actor && actor.notable_works) {
        this.movieService.getMovies().subscribe(movies => {
          this.notableMovies = movies.filter(m =>
            actor.notable_works?.includes(m.title)
          ).sort((a, b) => a.title.localeCompare(b.title));
        });
      }
    });
  }

  viewMovie(id: number): void {
    this.router.navigate(['/movies', id]);
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }
}
