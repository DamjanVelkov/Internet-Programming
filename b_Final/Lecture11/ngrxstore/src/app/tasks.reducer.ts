import { createReducer, on } from "@ngrx/store";
import { Task } from "./task.model";
import { addTask, clearCompleted, removeTask, setFilter, toggleTask } from "./tasks.actions";

export const TASKS_FEATURE_KEY = 'tasks';

export interface TasksState {
    items: Task[];
    filter: string;
}

export const initialState: TasksState = {
    items: [
        { id: 1, title: 'Learn NgRx basics', done: false },
        { id: 2, title: 'Wire components to Store', done: false },
        { id: 3, title: 'Refactor with selectors', done: true }
    ],
    filter: ''
}

export const tasksReducer = createReducer(
    initialState,
    on(addTask, (state, { title }) => ({
        ...state,
        items: [...state.items, {id: Date.now(), title: title.trim(), done: false }]
    })),
    on(toggleTask, (state, { id }) => ({
        ...state,
        items: state.items.map(t => t.id === id ? { ...t, done: !t.done } : t)
    })),
    on(removeTask, (state, { id }) => ({
        ...state,
        items: state.items.filter(t => t.id !== id)
    })),
    on(setFilter, (state, { text }) => ({
        ...state,
        filter: text
    })),
    on(clearCompleted, (state) => ({
        ...state,
        items: state.items.filter(t => !t.done)
    }))
)