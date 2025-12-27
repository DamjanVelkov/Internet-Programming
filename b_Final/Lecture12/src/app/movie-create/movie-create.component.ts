import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';

@Component({
  selector: 'app-movie-create',
  templateUrl: './movie-create.component.html',
  styleUrl: './movie-create.component.css'
})
export class MovieCreateComponent implements OnInit {
  movie: Movie = {
    id: 0,
    title: '',
    year: new Date().getFullYear(),
    director: '',
    genre: [],
    plot: '',
    rating: 0
  };
  genres: string[] = [];
  selectedGenres: string[] = [];

  constructor(
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.movieService.getGenres().subscribe(genres => {
      this.genres = genres;
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

  saveMovie(): void {
    const newMovie: Movie = {
      ...this.movie,
      genre: this.selectedGenres
    };
    this.movieService.addMovie(newMovie);
    this.router.navigate(['/movies']);
  }

  cancel(): void {
    this.router.navigate(['/movies']);
  }
}
