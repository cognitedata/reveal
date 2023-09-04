import { useCallback, useEffect, useRef, useState } from 'react';

import { BotUI } from '@botui/react';
import { createBot } from 'botui';
import * as localForage from 'localforage';
import { v4 as uuid } from 'uuid';

import { useToCopilotEventHandler } from '../../lib/hooks';
import { CopilotEvents, CopilotMessage } from '../../lib/types';
import { useFromCache, useSaveToCache } from '../hooks/useCache';
import {
  getChatHistory,
  useChats,
  useCreateChat,
} from '../hooks/useChatHistory';
import { CopilotContext, CopilotMode } from '../hooks/useCopilotContext';
import { useMetrics } from '../hooks/useMetrics';
export const CopilotContextProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [mode, setMode] = useState<CopilotMode>('chat');
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const bot = useRef(createBot());

  const { data: chats } = useChats();
  const { track } = useMetrics();

  const { data: isExpanded = false } =
    useFromCache<boolean>('CHATBOT_EXPANDED');

  const { mutate: setIsExpanded } = useSaveToCache<boolean>('CHATBOT_EXPANDED');
  const { mutate: createChat } = useCreateChat();

  const messages = useRef<CopilotMessage[]>([]);

  const createNewChat = useCallback(
    async (newMessages?: CopilotMessage[]) => {
      const id = uuid();
      await createChat({ id, messages: newMessages || [] });
      await getChatHistory('david', id);
      setCurrentChatId((currentId) => {
        if (!currentId) {
          track('NEW_CHAT', undefined);
        }

        return id;
      });
    },
    [createChat, track]
  );

  const onModeChange = useCallback(
    async (newMode: CopilotMode) => {
      setMode(newMode);
      track('MODE_CHANGE', { mode: newMode });
    },
    [setMode, track]
  );

  useEffect(() => {
    if (chats !== undefined && currentChatId === '') {
      if (chats.length > 0 && chats[0] !== null) {
        setCurrentChatId(chats[0].id);
      } else {
        createNewChat();
      }
    }
  }, [chats, createNewChat, currentChatId]);

  useEffect(() => {
    localForage.ready(() => setIsReady(true));
  }, []);

  const handleLoadingStatus = useCallback(
    ({ status }: CopilotEvents['ToCopilot']['LOADING_STATUS']) => {
      setLoadingStatus(status);
    },
    []
  );

  useToCopilotEventHandler('LOADING_STATUS', handleLoadingStatus);

  if (!isReady) {
    return <></>;
  }
  return (
    <CopilotContext.Provider
      value={{
        currentChatId,
        setCurrentChatId,
        createNewChat,
        mode,
        setMode: onModeChange,
        isExpanded: isExpanded || false,
        setIsExpanded,
        loadingStatus,
        setLoadingStatus,
        messages,
      }}
    >
      <BotUI bot={bot.current}>{children}</BotUI>
    </CopilotContext.Provider>
  );
};
