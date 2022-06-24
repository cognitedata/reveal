import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useGetURLSearchParams = () => {
  const { search } = useLocation();
  const urlSearchParam = useMemo(() => new URLSearchParams(search), [search]);
  return urlSearchParam;
};
