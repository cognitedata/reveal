import { MutableRefObject, createContext, useContext } from 'react';

import { CopilotMessage } from '../../lib/types';

export const useCopilotContext = () => useContext(CopilotContext);

export type CopilotMode = 'chat' | 'history';

// moved here becasue of circular dependency
export type CopilotContext = {
  currentChatId: string;
  setCurrentChatId: (chatId: string) => void;
  mode: CopilotMode;
  setMode: (newMode: CopilotMode) => void;
  createNewChat: (newMessages?: CopilotMessage[]) => void;
  isExpanded: boolean;
  setIsExpanded: (newVal: boolean) => void;
  loadingStatus: string;
  setLoadingStatus: (chatId: string) => void;
  messages: MutableRefObject<CopilotMessage[]>;
};

export const CopilotContext = createContext<CopilotContext>(
  {} as CopilotContext
);
