import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import localforage, * as localForage from 'localforage';

import { useSDK } from '@cognite/sdk-provider';

import { CopilotMessage } from '../../lib/types';

import { getCacheKey } from './useCache';
import { useCopilotContext } from '../utils/CopilotContext';

const CHAT_PREFIX = 'chats-1';

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
  const key = getCacheKey(sdk.project, `${CHAT_PREFIX}`);
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

export const getChatHistory = async (project: string, id: string) => {
  const key = getCacheKey(project, `${CHAT_PREFIX}-${id}`);
  return localforage.getItem<Chat>(key);
};

export const useChat = (id: string) => {
  const sdk = useSDK();
  const key = getCacheKey(sdk.project, `${CHAT_PREFIX}-${id}`);
  return useQuery([key], () => localforage.getItem<Chat>(key));
};

export const useSaveChat = (id: string) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const { data } = useChat(id);
  const key = getCacheKey(sdk.project, `${CHAT_PREFIX}-${id}`);
  return useMutation(
    [key],
    (messages: CopilotMessage[]) =>
      id
        ? localForage.setItem<Chat>(key, {
            ...data,
            id,
            dateUpdated: new Date(),
            dateCreated: data?.dateCreated || new Date(),
            history: messages,
          })
        : Promise.resolve(null),
    {
      onSettled: (value) => {
        queryClient.setQueryData([key], value);
      },
    }
  );
};
export const useDeleteChat = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const { currentChatId, setCurrentChatId } = useCopilotContext();
  return useMutation(
    [getCacheKey(sdk.project, `delete-1`)],
    async (id: string) => {
      await localForage.removeItem(
        getCacheKey(sdk.project, `${CHAT_PREFIX}-${id}`)
      );
      return id;
    },
    {
      onSettled: (id) => {
        queryClient.setQueryData(
          [getCacheKey(sdk.project, `${CHAT_PREFIX}-${id}`)],
          null
        );
        const currentChats = [
          ...(queryClient.getQueryData<Chat[]>([
            getCacheKey(sdk.project, `${CHAT_PREFIX}`),
          ]) || []),
        ];
        const index = currentChats.findIndex((el) => el.id === id);
        currentChats.splice(index, 1);

        queryClient.setQueryData<Chat[]>(
          [getCacheKey(sdk.project, `${CHAT_PREFIX}`)],
          currentChats
        );

        if (currentChatId === id) {
          setCurrentChatId(currentChats.length > 0 ? currentChats[0].id : '');
        }
        if (currentChats.length === 0) {
          setCurrentChatId('');
        }
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
    (id: string) =>
      id
        ? localForage.setItem<Chat>(
            getCacheKey(sdk.project, `${CHAT_PREFIX}-${id}`),
            {
              id,
              dateUpdated: new Date(),
              dateCreated: new Date(),
              history: [],
            }
          )
        : Promise.resolve(null),
    {
      onSuccess: (chat) => {
        if (chat) {
          queryClient.setQueryData(
            [getCacheKey(sdk.project, `${CHAT_PREFIX}-${chat.id}`)],
            chat
          );
          const currentChats = queryClient.getQueryData<Chat[]>([
            getCacheKey(sdk.project, `${CHAT_PREFIX}`),
          ]);
          queryClient.setQueryData<Chat[]>(
            [getCacheKey(sdk.project, `${CHAT_PREFIX}`)],
            [...(currentChats || []), chat]
          );
        }
      },
    }
  );
};
