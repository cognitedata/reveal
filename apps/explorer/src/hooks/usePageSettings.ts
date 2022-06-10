import { useRouteMatch } from 'react-router-dom';
import { PAGES } from 'pages/routers/constants';

export const usePageSettings = () => {
  const match = useRouteMatch(PAGES.HOME)?.isExact || false;
  return {
    isFullScreen: match,
  };
};
