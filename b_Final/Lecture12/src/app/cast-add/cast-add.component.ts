import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cast-add',
  templateUrl: './cast-add.component.html',
  styleUrl: './cast-add.component.css'
})
export class CastAddComponent implements OnInit {
  movie$: Observable<Movie | undefined>;
  movieId: number = 0;
  actor: string = '';
  character: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router
  ) {
    this.movie$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.movieId = +params.get('id')!;
        return this.movieService.getMovieById(this.movieId);
      })
    );
  }

  ngOnInit(): void {
  }

  addCastMember(): void {
    if (this.actor.trim() && this.character.trim()) {
      this.movieService.addCastMember(this.movieId, this.actor, this.character);
      this.router.navigate(['/movies', this.movieId]);
    }
  }

  cancel(): void {
    this.router.navigate(['/movies', this.movieId]);
  }
}
