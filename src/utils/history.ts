import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();
export const createHistory = createBrowserHistory;

export type AppHistory = typeof history;
