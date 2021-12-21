import flatten from 'lodash/flatten';

import { useCache, CacheProps } from './useCache';

export const useArrayCache = <T>(props: CacheProps<T>) => {
  const { data, ...rest } = useCache(props);

  return {
    ...rest,
    data: data ? flatten(Object.values(data)) : undefined,
  };
};
