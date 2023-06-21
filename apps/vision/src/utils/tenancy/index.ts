import queryString from 'query-string';

export const getTenant = () => {
  const { pathname } = window.location;
  if (!pathname) {
    return '';
  }
  const match = pathname.match(/^\/([a-z0-9-]+)\/?/);
  if (!match) {
    return '';
  }
  return match[1];
};

// TODO: add test
export const getIdFromUrl = () => {
  const { pathname } = window.location;
  if (!pathname) {
    return '';
  }
  const match = pathname.match(/\/(\d+)/);
  if (!match) {
    return '';
  }
  return match[1];
};

export const pushPath = (path: string) => {
  // I'll keep the environment variables in the url params:
  return `${path}?env=${queryString.parse(window.location.search).env}`;
};

export const getEnvironment = () => {
  // Finding the environment variable in the url params.
  if (queryString.parse(window.location.search).env)
    return queryString.parse(window.location.search).env as string;

  // The default cluster is api.
  return 'api';
};
