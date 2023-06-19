import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CACHE_KEY, getFromCache, saveToCache } from '../utils/cache';

export const useFromCache = <T,>(key: keyof typeof CACHE_KEY) =>
  useQuery([key], () => getFromCache<T>(key));

export const useSaveToCache = <T,>(key: keyof typeof CACHE_KEY) => {
  const queryClient = useQueryClient();
  return useMutation([key], (value: T) => saveToCache(key, value), {
    onSettled: (value) => {
      queryClient.setQueryData([key], value);
    },
  });
};
