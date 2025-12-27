import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type SortField = 'id' | 'title' | 'year' | 'director' | 'genre' | 'oscars' | 'rating';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent implements OnInit {
  movies$: Observable<Movie[]>;
  filteredMovies: Movie[] = [];
  allMovies: Movie[] = [];
  genres$: Observable<string[]>;
  
  // Filter properties
  titleFilter = '';
  yearFilter = '';
  genreFilter = '';
  ratingFilter = '';
  
  // Sorting properties
  sortField: SortField | null = null;
  sortAscending = true;

  constructor(private movieService: MovieService, private router: Router) {
    this.movies$ = this.movieService.getMovies();
    this.genres$ = this.movieService.getGenres();
  }

  ngOnInit(): void {
    this.movies$.subscribe(movies => {
      this.allMovies = movies;
      this.applyFiltersAndSort();
    });
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.allMovies];

    // Apply filters
    if (this.titleFilter) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(this.titleFilter.toLowerCase())
      );
    }

    if (this.yearFilter) {
      const year = parseInt(this.yearFilter);
      filtered = filtered.filter(m => m.year === year);
    }

    if (this.genreFilter) {
      filtered = filtered.filter(m => 
        m.genre.includes(this.genreFilter)
      );
    }

    if (this.ratingFilter) {
      const rating = parseFloat(this.ratingFilter);
      filtered = filtered.filter(m => (m.rating || 0) >= rating);
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;

        switch (this.sortField) {
          case 'id':
            aVal = a.id;
            bVal = b.id;
            break;
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'year':
            aVal = a.year;
            bVal = b.year;
            break;
          case 'director':
            aVal = a.director.toLowerCase();
            bVal = b.director.toLowerCase();
            break;
          case 'genre':
            aVal = a.genre.length;
            bVal = b.genre.length;
            if (aVal === bVal) {
              aVal = a.genre.slice().sort().join(',');
              bVal = b.genre.slice().sort().join(',');
            }
            break;
          case 'oscars':
            aVal = a.oscars ? Object.keys(a.oscars).length : 0;
            bVal = b.oscars ? Object.keys(b.oscars).length : 0;
            break;
          case 'rating':
            aVal = a.rating || 0;
            bVal = b.rating || 0;
            break;
        }

        if (aVal < bVal) return this.sortAscending ? -1 : 1;
        if (aVal > bVal) return this.sortAscending ? 1 : -1;
        return 0;
      });
    }

    this.filteredMovies = filtered;
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  toggleSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortField = field;
      this.sortAscending = true;
    }
    this.applyFiltersAndSort();
  }

  getOscarCount(movie: Movie): number {
    return movie.oscars ? Object.keys(movie.oscars).length : 0;
  }

  getSortIndicator(field: SortField): string {
    if (this.sortField !== field) return '⇅';
    return this.sortAscending ? '↑' : '↓';
  }

  viewMovie(id: number): void {
    this.router.navigate(['/movies', id]);
  }

  editMovie(id: number): void {
    this.router.navigate(['/movies', id, 'edit']);
  }

  deleteMovie(id: number): void {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.deleteMovie(id);
      this.applyFiltersAndSort();
    }
  }

  addCast(id: number): void {
    this.router.navigate(['/movies', id, 'cast', 'add']);
  }

  navigateToCreate(): void {
    this.router.navigate(['/movies', 'create']);
  }
}
