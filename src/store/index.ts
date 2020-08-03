import { Store, AnyAction } from 'redux';
import { createBrowserHistory } from 'history';
import { createPreserveQueryAndHashHistory } from './history';

export const history = createPreserveQueryAndHashHistory(createBrowserHistory, [
  'env',
  'apikey',
])();

const { default: store }: { default: (store?: any) => Store<any, AnyAction> } =
  process.env.NODE_ENV === 'production'
    ? require('./storeProd.ts')
    : require('./storeDev.ts');

// Exporting the store, then use it anywhere like store.getState() or store.dispatch()
export default store();
