import { useRouteMatch } from 'react-router-dom-v5';
import { PAGES } from 'pages/constants';

export const usePageSettings = () => {
  const matchHomePath = useRouteMatch(PAGES.HOME)?.path;
  const isFullScreen = matchHomePath === PAGES.HOME || false;

  return {
    isFullScreen,
  };
};
