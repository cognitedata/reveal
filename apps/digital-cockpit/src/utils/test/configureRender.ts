import createBrowserHistory from 'utils/history';
import { createLocation, History } from 'history';
import { configureStore } from 'store';

import { BaseRenderOptions } from './types';

function configureTestHistory(
  maybeTenant?: string,
  maybePathname?: string
): History {
  const history = createBrowserHistory(maybeTenant || '');
  if (maybePathname) {
    history.location = createLocation(maybePathname);
  }
  return history;
}

function configureRender(options: BaseRenderOptions) {
  const { redux = {} } = options;

  const store = configureStore(redux);
  const history = configureTestHistory();

  return { store, history };
}

export default configureRender;
