import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TASKS_FEATURE_KEY, TasksState } from "./tasks.reducer";

export const selectTasksState = createFeatureSelector<TasksState>(TASKS_FEATURE_KEY);

export const selectItems = createSelector(selectTasksState, s => s.items);
export const selectFilter = createSelector(selectTasksState, s => s.filter);

export const selectVisible = createSelector(selectItems, selectFilter, (items, filter) => {
    const f = (filter ?? '').toLowerCase().trim();
    return f ? items.filter(t => t.title.toLowerCase().includes(f)) : items;
});

export const selectRemaining = createSelector(selectItems,
    items => items.filter(t => !t.done).length
);
