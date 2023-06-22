import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as localForage from 'localforage';

import { useSDK } from '@cognite/sdk-provider';

export const CACHE_KEY = {
  SMALL_CHATBOT_DIMENTIONS: 'SMALL_CHATBOT_DIMENTIONS',
  CHATBOT_EXPANDED: 'CHATBOT_EXPANDED',
  CHAT_HISTORY: 'CHAT_HISTORY',
} as const;

const getKey = (project: string, key: string) =>
  `cdf-copilot-${project}-${key}`;

export const useFromCache = <T,>(key: keyof typeof CACHE_KEY) => {
  const sdk = useSDK();
  return useQuery([key], () => getFromCache<T>(sdk.project, key));
};

export const useSaveToCache = <T,>(key: keyof typeof CACHE_KEY) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    [key],
    (value: T) => saveToCache(sdk.project, key, value),
    {
      onSettled: (value) => {
        queryClient.setQueryData([key], value);
      },
    }
  );
};

export const saveToCache = async <T,>(
  project: string,
  key: keyof typeof CACHE_KEY,
  value: T
) => {
  return localForage.setItem(getKey(project, key), value);
};

export const getFromCache = async <T,>(
  project: string,
  key: keyof typeof CACHE_KEY
) => {
  return ((await localForage.getItem(getKey(project, key))) ||
    null) as T | null;
};
