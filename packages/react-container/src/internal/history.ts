import { Metrics } from '@cognite/metrics';
import {
  createBrowserHistory as createNewBrowserHistory,
  History,
} from 'history';

export function createBrowserHistory(tenant: string) {
  const historyInstance: History = createNewBrowserHistory({
    basename: tenant,
  });

  if (process.env.NODE_ENV === 'production') {
    const metrics = Metrics.create('Redux');

    historyInstance.listen((location, locationAction) => {
      const { pathname } = location;
      metrics.track('router/LOCATION_CHANGE', { locationAction, pathname });
    });
  }

  return historyInstance;
}
