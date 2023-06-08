import { createStore as createStoreDev } from '@interactive-diagrams-app/store/env/storeDev';
import { createStore as createStoreProd } from '@interactive-diagrams-app/store/env/storeProd';
import { createPreserveQueryAndHashHistory } from '@interactive-diagrams-app/store/history';
import { Store, AnyAction } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';

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
