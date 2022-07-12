import { useMemo } from 'react';

export const useSetURLSearchParams = (searchParams: Record<string, string>) => {
  const urlSearchParam = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );
  return urlSearchParam;
};
