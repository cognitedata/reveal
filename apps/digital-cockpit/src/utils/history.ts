import { createBrowserHistory as createNewBrowserHistory } from 'history';

export const createBrowserHistory = (tenant = '') => {
  return createNewBrowserHistory({
    basename: tenant,
  });
};

export default createBrowserHistory;
