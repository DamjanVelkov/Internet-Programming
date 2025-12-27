import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { StandingsComponent } from './pages/standings/standings.component';
import { MatchesComponent } from './pages/matches/matches.component';
import { MatchDetailComponent } from './pages/match-detail/match-detail.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';
import { PlayerDetailComponent } from './pages/player-detail/player-detail.component';
import { StatsComponent } from './pages/stats/stats.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'La Liga Hub - Home'
  },
  {
    path: 'standings',
    component: StandingsComponent,
    title: 'La Liga Hub - Standings'
  },
  {
    path: 'matches',
    component: MatchesComponent,
    title: 'La Liga Hub - Matches'
  },
  {
    path: 'match/:id',
    component: MatchDetailComponent,
    title: 'La Liga Hub - Match Details'
  },
  {
    path: 'teams',
    component: TeamsComponent,
    title: 'La Liga Hub - Teams'
  },
  {
    path: 'team/:id',
    component: TeamDetailComponent,
    title: 'La Liga Hub - Team Details'
  },
  {
    path: 'player/:id',
    component: PlayerDetailComponent,
    title: 'La Liga Hub - Player Details'
  },
  {
    path: 'stats',
    component: StatsComponent,
    title: 'La Liga Hub - Statistics'
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    title: 'La Liga Hub - My Favorites'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
