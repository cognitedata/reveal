import { useLocation as useDefaultLocation } from 'react-router-dom';

export const useLocation = () => {
  const location = useDefaultLocation();

  const isSearchPage = location.pathname.startsWith('/search');

  return {
    isSearchPage,
  };
};
