import { configureStore } from 'core/store';

// only for tests
export const store = configureStore();
export const configureTestStore = (initialState) =>
  configureStore(initialState);
