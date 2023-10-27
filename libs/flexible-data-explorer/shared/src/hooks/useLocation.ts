import { useLocation as useDefaultLocation } from 'react-router-dom';

import { getProject } from '@cognite/cdf-utilities';

export const useLocation = () => {
  const location = useDefaultLocation();
  const project = getProject();

  const isSearchPage =
    location.pathname.startsWith('/explore/search') ||
    location.pathname.startsWith('/search') ||
    location.pathname.startsWith(`/${project}/search/search`);
  const isHomePage =
    location.pathname === '/' ||
    location.pathname === '/explore' ||
    location.pathname.startsWith(`/${project}/search`);

  return {
    isHomePage,
    isSearchPage,
  };
};
