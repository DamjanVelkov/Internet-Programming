import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingSpinnerComponent } from './components/shared/loading-spinner/loading-spinner.component';
import { MatchCardComponent } from './components/shared/match-card/match-card.component';
import { PlayerCardComponent } from './components/shared/player-card/player-card.component';

// Standalone Components
import { SeasonSelectorComponent } from './shared/season-selector/season-selector.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { StandingsComponent } from './pages/standings/standings.component';
import { MatchesComponent } from './pages/matches/matches.component';
import { MatchDetailComponent } from './pages/match-detail/match-detail.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';
import { PlayerDetailComponent } from './pages/player-detail/player-detail.component';
import { StatsComponent } from './pages/stats/stats.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';

@NgModule({
  declarations: [
    AppComponent,
    // Components
    HeaderComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    MatchCardComponent,
    PlayerCardComponent,
    // Pages
    HomeComponent,
    StandingsComponent,
    MatchesComponent,
    MatchDetailComponent,
    TeamsComponent,
    PlayerDetailComponent,
    StatsComponent,
    FavoritesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    // Standalone Components
    SeasonSelectorComponent,
    TeamDetailComponent
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
