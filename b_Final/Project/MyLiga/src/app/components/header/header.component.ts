import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ThemeService, Theme } from '../../services/theme.service';
import { FootballApiService } from '../../services/football-api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'light';
  isMenuOpen = false;
  isLoading = false;
  activeRoute = '';
  
  private destroy$ = new Subject<void>();

  navLinks = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/standings', label: 'Standings', icon: 'table' },
    { path: '/matches', label: 'Matches', icon: 'calendar' },
    { path: '/teams', label: 'Teams', icon: 'shield' },
    { path: '/stats', label: 'Stats', icon: 'chart' },
    { path: '/favorites', label: 'Favorites', icon: 'heart' }
  ];

  constructor(
    private themeService: ThemeService,
    private footballApi: FootballApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.currentTheme = theme);

    this.footballApi.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.activeRoute = event.urlAfterRedirects;
        this.isMenuOpen = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isActive(path: string): boolean {
    if (path === '/') {
      return this.activeRoute === '/' || this.activeRoute === '';
    }
    return this.activeRoute.startsWith(path);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
