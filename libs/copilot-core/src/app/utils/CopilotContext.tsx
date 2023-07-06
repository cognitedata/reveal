import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BotUI } from '@botui/react';
import { createBot } from 'botui';
import * as localForage from 'localforage';
import { v4 as uuid } from 'uuid';

import { useFromCache, useSaveToCache } from '../hooks/useCache';
import { useChats, useCreateChat } from '../hooks/useChatHistory';

type CopilotMode = 'chat' | 'history';

type CopilotContext = {
  currentChatId: string;
  setCurrentChatId: (chatId: string) => void;
  mode: CopilotMode;
  setMode: (newMode: CopilotMode) => void;
  createNewChat: () => void;
  isExpanded: boolean;
  setIsExpanded: (newVal: boolean) => void;
};

export const CopilotContext = createContext<CopilotContext>(
  {} as CopilotContext
);

export const useCopilotContext = () => useContext(CopilotContext);

export const CopilotContextProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [mode, setMode] = useState<CopilotMode>('chat');
  const [isReady, setIsReady] = useState(false);
  const bot = useRef(createBot());

  const { data: chats } = useChats();

  const { data: isExpanded = false } =
    useFromCache<boolean>('CHATBOT_EXPANDED');

  const { mutate: setIsExpanded } = useSaveToCache<boolean>('CHATBOT_EXPANDED');
  const { mutate: createChat } = useCreateChat();

  const createNewChat = useCallback(async () => {
    const id = uuid();
    await createChat(id);
    setCurrentChatId(id);
  }, [createChat]);

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

  useEffect(() => {
    bot.current = createBot();
  }, [currentChatId]);

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
        setMode,
        isExpanded: isExpanded || false,
        setIsExpanded,
      }}
    >
      <BotUI bot={bot.current}>{children}</BotUI>
    </CopilotContext.Provider>
  );
};
