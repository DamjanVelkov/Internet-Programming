import { Routes } from '@angular/router';
import { EpisodesListComponent } from './episodes-list';
import { EpisodeDetailsComponent } from './episode-details';

export const routes: Routes = [
    { path: '', component: EpisodesListComponent },
    { path: 'episodes/:id', component: EpisodeDetailsComponent },
    { path: '**', redirectTo: '' }
];
