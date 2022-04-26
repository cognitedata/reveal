import { useLocation } from 'react-router-dom';

import navigationConfig from '../constants/navigation';

export const usePageSettings = () => {
  const { pathname } = useLocation();

  return {
    scrollPage: !(
      pathname.startsWith(navigationConfig.SEARCH) ||
      pathname.includes(navigationConfig.ADMIN_LEGEND)
    ), // right now the page should not scroll for any child route of 'search/'
    collapseTopbar: true, // This is hardcoded to true, if scrollPage is false it doesn't matter if this is true
  };
};
