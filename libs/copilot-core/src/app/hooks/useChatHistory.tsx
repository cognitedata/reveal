import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import localforage, * as localForage from 'localforage';

import { useSDK } from '@cognite/sdk-provider';

import { CopilotMessage } from '../../lib/types';

import { getCacheKey } from './useCache';

export const CACHE_KEY = {
  SMALL_CHATBOT_DIMENTIONS: 'SMALL_CHATBOT_DIMENTIONS',
  CHATBOT_EXPANDED: 'CHATBOT_EXPANDED',
} as const;

export type Chat = {
  id: string;
  dateUpdated: Date;
  dateCreated: Date;
  name?: string;
  history: CopilotMessage[];
};

export const useChats = () => {
  const sdk = useSDK();
  const key = getCacheKey(sdk.project, 'chats-1-');
  return useQuery([key], () =>
    localForage.keys().then((keys) =>
      Promise.all(
        keys
          .filter((el) => el.startsWith(key))
          .map((currKey) => {
            return localForage.getItem<Chat>(currKey);
          })
      ).then((chats) =>
        (chats.filter((el) => !!el) as Chat[]).sort(
          (a, b) => b.dateUpdated.getTime() - a.dateUpdated.getTime()
        )
      )
    )
  );
};

export const useChat = (id: string) => {
  const sdk = useSDK();
  const key = getCacheKey(sdk.project, `chats-1-${id}`);
  return useQuery([key], () => localforage.getItem<Chat>(key));
};

export const useSaveChat = (id: string) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const { data } = useChat(id);
  const key = getCacheKey(sdk.project, `chats-1-${id}`);
  return useMutation(
    [key],
    (messages: CopilotMessage[]) =>
      localForage.setItem<Chat>(key, {
        ...data,
        id,
        dateUpdated: new Date(),
        dateCreated: data?.dateCreated || new Date(),
        history: messages,
      }),
    {
      onSettled: (value) => {
        queryClient.setQueryData([key], value);
      },
    }
  );
};
export const useCreateChat = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const key = getCacheKey(sdk.project, `new-chats-1`);
  return useMutation(
    [key],
    async (id: string) =>
      await localForage.setItem<Chat>(
        getCacheKey(sdk.project, `chats-1-${id}`),
        {
          id,
          dateUpdated: new Date(),
          dateCreated: new Date(),
          history: [],
        }
      ),
    {
      onSuccess: (chat) => {
        queryClient.setQueryData([key], chat);
        if (chat) {
          const currentChats = queryClient.getQueryData<Chat[]>([
            getCacheKey(sdk.project, 'chats-1-'),
          ]);
          queryClient.setQueryData<Chat[]>(
            [getCacheKey(sdk.project, 'chats-1-')],
            [...(currentChats || []), chat]
          );
        }
      },
    }
  );
};
