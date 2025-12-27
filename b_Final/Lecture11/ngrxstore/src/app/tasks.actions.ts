import { createAction, props } from "@ngrx/store";

export const addTask = createAction('[Tasks] Add', props<{title: string}>());
export const toggleTask = createAction('[Tasks] Toggle', props<{id: number}>());
export const removeTask = createAction('[Tasks] Remove', props<{id: number}>());
export const setFilter = createAction('[Tasks] Set Filter', props<{text: string}>());
export const clearCompleted = createAction('[Tasks] Clear Completed');