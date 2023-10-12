import { createLink } from '@cognite/cdf-utilities';

export const createInternalLink = (path?: string | number) => {
  const mountPoint = window.location.pathname.split('/')[2];
  return createLink(`/${mountPoint}/${path || ''}`);
};
