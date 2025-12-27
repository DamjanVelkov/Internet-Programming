import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'laliga_theme';
  private themeSubject!: BehaviorSubject<Theme>;
  private isBrowser: boolean;
  
  public theme$!: Observable<Theme>;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.themeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());
    this.theme$ = this.themeSubject.asObservable();
    
    if (this.isBrowser) {
      this.applyTheme(this.themeSubject.value);
    }
  }

  private getStoredTheme(): Theme {
    if (!this.isBrowser) {
      return 'light';
    }
    
    try {
      const stored = localStorage.getItem(this.THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // localStorage not available
    }
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.THEME_KEY, theme);
      } catch {
        // localStorage not available
      }
    }
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  isDarkMode(): boolean {
    return this.themeSubject.value === 'dark';
  }
}
