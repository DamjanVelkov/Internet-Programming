import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { Movie, Actor } from '../models/movie';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  totalMovies = 0;
  totalActors = 0;
  totalGenres = 0;
  totalOscars = 0;
  oscarsByType: { [key: string]: number } = {};
  oscarsByGenre: { [key: string]: number } = {};
  moviesByDecade: { [key: string]: number } = {};
  moviesByGenre: { [key: string]: number } = {};
  actorsWithoutDetails = 0;
  actorsWithoutDetailsList: Actor[] = [];
  moviesWithoutDetails = 0;
  moviesWithoutDetailsList: Movie[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getMovies().subscribe(movies => {
      this.calculateStatistics(movies);
    });
  }

  private calculateStatistics(movies: Movie[]): void {
    this.totalMovies = movies.length;

    // Movies by genre
    this.moviesByGenre = {};
    movies.forEach(movie => {
      movie.genre.forEach(genre => {
        this.moviesByGenre[genre] = (this.moviesByGenre[genre] || 0) + 1;
      });
    });

    // Movies by decade
    this.moviesByDecade = {};
    movies.forEach(movie => {
      const decade = Math.floor(movie.year / 10) * 10;
      const decadeLabel = `${decade}s`;
      this.moviesByDecade[decadeLabel] = (this.moviesByDecade[decadeLabel] || 0) + 1;
    });

    // Oscars by type and genre
    this.oscarsByType = {};
    this.oscarsByGenre = {};
    this.totalOscars = 0;

    movies.forEach(movie => {
      if (movie.oscars) {
        Object.keys(movie.oscars).forEach(oscarType => {
          this.oscarsByType[oscarType] = (this.oscarsByType[oscarType] || 0) + 1;
          this.totalOscars++;

          movie.genre.forEach(genre => {
            this.oscarsByGenre[genre] = (this.oscarsByGenre[genre] || 0) + 1;
          });
        });
      }
    });

    // Get all actors and count
    this.movieService.getActors().subscribe(actors => {
      this.totalActors = actors.length;
      
      // Count actors without details
      this.actorsWithoutDetailsList = actors.filter(actor =>
        !actor.birthdate && !actor.height && !actor.nationality && !actor.notable_works
      );
      this.actorsWithoutDetails = this.actorsWithoutDetailsList.length;
    });

    // Movies without details
    this.moviesWithoutDetailsList = movies.filter(movie =>
      !movie.plot && (!movie.cast || movie.cast.length === 0) && !movie.oscars && !movie.rating
    );
    this.moviesWithoutDetails = this.moviesWithoutDetailsList.length;

    // Get genres count
    this.movieService.getGenres().subscribe(genres => {
      this.totalGenres = genres.length;
    });
  }

  formatOscarType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }

  getOscarTypesSorted(): string[] {
    return Object.keys(this.oscarsByType).sort();
  }

  getGenresSorted(): string[] {
    return Object.keys(this.moviesByGenre).sort();
  }

  getDecadesSorted(): string[] {
    return Object.keys(this.moviesByDecade).sort();
  }

  getOscarsByGenreCount(): number {
    return Object.keys(this.oscarsByGenre).filter(g => this.oscarsByGenre[g]).length;
  }
}
