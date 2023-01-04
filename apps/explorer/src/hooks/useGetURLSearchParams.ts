import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5';

export const useGetURLSearchParams = () => {
  const { search } = useLocation();
  const urlSearchParam = useMemo(() => new URLSearchParams(search), [search]);
  return urlSearchParam;
};
