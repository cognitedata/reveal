import { Store, AnyAction } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import { createPreserveQueryAndHashHistory } from './history';
import { createStore as createStoreDev } from './storeDev';
import { createStore as createStoreProd } from './storeProd';
import { RootState } from './reducer';

export const history = createPreserveQueryAndHashHistory(createBrowserHistory, [
  'env',
  'apikey',
])();

const store: Store<any, AnyAction> =
  process.env.NODE_ENV === 'production' ? createStoreProd() : createStoreDev();

// Exporting the store, then use it anywhere like store.getState() or store.dispatch()
export default store;
export type { RootState };
export * from './localStorage';
