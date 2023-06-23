import { Store, AnyAction } from '@reduxjs/toolkit';

import { createStore as createStoreDev } from './env/storeDev';
import { createStore as createStoreProd } from './env/storeProd';
import { RootState } from './reducer';

const store: Store<any, AnyAction> =
  process.env.NODE_ENV === 'production' ? createStoreProd() : createStoreDev();

// Exporting the store, then use it anywhere like store.getState() or store.dispatch()
export default store;
export type { RootState };
export * from './localStorage';
