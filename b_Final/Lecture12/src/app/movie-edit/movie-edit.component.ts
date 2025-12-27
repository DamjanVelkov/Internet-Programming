import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-movie-edit',
  templateUrl: './movie-edit.component.html',
  styleUrl: './movie-edit.component.css'
})
export class MovieEditComponent implements OnInit {
  movie: Movie | null = null;
  genres: string[] = [];
  selectedGenres: string[] = [];
  oscars: { [key: string]: string } = {};
  oscarTypes = ['bestPicture', 'bestDirector', 'bestActor', 'bestActress', 'bestSupportingActor', 'bestSupportingActress', 'bestAdaptedScreenplay', 'bestOriginalScreenplay'];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.movieService.getGenres().subscribe(genres => {
      this.genres = genres;
    });

    this.route.paramMap.pipe(
      switchMap(params => this.movieService.getMovieById(+params.get('id')!))
    ).subscribe(movie => {
      if (movie) {
        this.movie = { ...movie };
        this.selectedGenres = [...movie.genre];
        this.oscars = movie.oscars ? { ...movie.oscars } : {};
      }
    });
  }

  toggleGenre(genre: string): void {
    const index = this.selectedGenres.indexOf(genre);
    if (index === -1) {
      this.selectedGenres.push(genre);
    } else {
      this.selectedGenres.splice(index, 1);
    }
  }

  isGenreSelected(genre: string): boolean {
    return this.selectedGenres.includes(genre);
  }

  addOscar(): void {
    const newType = prompt('Enter oscar type:');
    if (newType) {
      this.oscars[newType] = '';
    }
  }

  removeOscar(type: string): void {
    delete this.oscars[type];
    this.oscars = { ...this.oscars };
  }

  formatOscarType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }

  saveMovie(): void {
    if (this.movie) {
      this.movie.genre = this.selectedGenres;
      this.movie.oscars = this.oscars;
      this.movieService.updateMovie(this.movie.id, this.movie);
      this.router.navigate(['/movies', this.movie.id]);
    }
  }

  cancel(): void {
    if (this.movie) {
      this.router.navigate(['/movies', this.movie.id]);
    }
  }
}

