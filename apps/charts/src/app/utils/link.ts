import { createLink, isUsingUnifiedSignin } from '@cognite/cdf-utilities';

export const createInternalLink = (path?: string | number) => {
  const mountPoint =
    window.location.pathname.split('/')[isUsingUnifiedSignin() ? 3 : 2];
  return createLink(`/${mountPoint}/${path || ''}`);
};
