import { Store, AnyAction } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import { createPreserveQueryAndHashHistory } from 'store/history';
import { createStore as createStoreDev } from 'store/env/storeDev';
import { createStore as createStoreProd } from 'store/env/storeProd';
import { RootState } from './reducer';

export const history = createPreserveQueryAndHashHistory(createBrowserHistory, [
  'env',
  'apikey',
])();

console.log('env', process.env.NODE_ENV);
const store: Store<any, AnyAction> =
  process.env.NODE_ENV === 'production' ? createStoreProd() : createStoreDev();

// Exporting the store, then use it anywhere like store.getState() or store.dispatch()
export default store;
export type { RootState };
export * from './localStorage';
