import { Routes } from '@angular/router';
import { GroupsListComponent } from './group-list/group-list';
import { GroupDetailsComponent } from './group-details/group-details';

export const routes: Routes = [
    { path: '', component: GroupsListComponent },
    { path: 'groups/:id', component: GroupDetailsComponent },
    { path: '**', redirectTo: ''}
];
