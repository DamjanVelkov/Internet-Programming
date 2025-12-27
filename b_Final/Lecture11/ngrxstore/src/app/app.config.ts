import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { TASKS_FEATURE_KEY, tasksReducer } from './tasks.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ [TASKS_FEATURE_KEY]: tasksReducer })
  ]
};
