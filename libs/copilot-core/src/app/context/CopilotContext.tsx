import {
  MutableRefObject,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BotUI } from '@botui/react';
import { createBot } from 'botui';
import * as localForage from 'localforage';
import { v4 as uuid } from 'uuid';

import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../lib/CogniteBaseFlow';
import {
  CopilotAction,
  CopilotBotResponse,
  CopilotMessage,
  UserAction,
} from '../../lib/types';
import { ChatUI } from '../components/ChatUI';
import { CopilotButton } from '../components/CopilotButton';
import { useFromCache, useSaveToCache } from '../hooks/useCache';
import {
  getChatHistory,
  useChats,
  useCreateChat,
  useSaveChat,
} from '../hooks/useChatHistory';
import { useMetrics } from '../hooks/useMetrics';

export type CopilotMode = 'chat' | 'history';

type CopilotRunFlowFn = <
  A extends { sdk: CogniteClient },
  B extends CopilotBotResponse
>(
  flow: Flow<A, B>,
  input?: A | null,
  showInChat?: boolean,
  initialMessage?: CopilotMessage
) => Promise<B>;

type CopilotRegisterFlowFn = <
  A extends { sdk: CogniteClient },
  B extends CopilotBotResponse
>(enableFlow: {
  flow: Flow<A, B>;
  input?: Partial<{ [a in keyof A]: () => A[a] }>;
  messageActions?: Partial<{
    [key in B['type']]: (data: B) => CopilotAction[];
  }>;
}) => () => void;

type CopilotLoadingStatus =
  | {
      status: string;
      stage?: number;
    }
  | undefined;

// moved here becasue of circular dependency
export type CopilotContext = {
  activeFlow: Flow<any, any> | undefined;
  availableFlows: Flow<any, any>[];
  loadingStatus: CopilotLoadingStatus;
  setLoadingStatus: (status: CopilotLoadingStatus) => void;
  // UI action
  createNewChat: (newMessages?: CopilotMessage[]) => void;
  registerFlow: CopilotRegisterFlowFn;
  runFlow: CopilotRunFlowFn;
  showChatButton: boolean;
  isOpen: boolean;
  actionGetters: Partial<{
    [key in CopilotMessage['type']]: ((
      data: CopilotMessage
    ) => CopilotAction[])[];
  }>;
  isReady: boolean;
  // UI state
  setShowChatButton: (newVal: boolean) => void;
  setIsOpen: (newVal: boolean) => void;
  currentChatId: string;
  action: UserAction | undefined;
  setAction: (newAction: UserAction | undefined) => void;
  setCurrentChatId: (chatId: string) => void;
  messages: MutableRefObject<CopilotMessage[]>;
  mode: CopilotMode;
  setMode: (newMode: CopilotMode) => void;
  isExpanded: boolean;
  setIsExpanded: (newVal: boolean) => void;
  addMessages: (messages: CopilotMessage[]) => void;
};

export const CopilotContext = createContext<CopilotContext>(
  {} as CopilotContext
);
export type CopilotContextProviderProps = {
  sdk: CogniteClient;
  showChatButton?: boolean;
  children?: React.ReactNode;
};

export const CopilotContextProvider = ({
  sdk,
  children,
  showChatButton: propsShowChatButton = true,
}: CopilotContextProviderProps) => {
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [showChatButton, setShowChatButton] =
    useState<boolean>(propsShowChatButton);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<CopilotMode>('chat');
  const [loadingStatus, setLoadingStatus] = useState<CopilotLoadingStatus>();
  const [activeFlow, setActiveFlow] = useState<Flow<any, any> | undefined>();
  const [action, setAction] = useState<UserAction | undefined>();
  const [defaultGetters, setDefaultGetters] = useState<
    Partial<{
      [key in string]: { [key2 in string]: () => any };
    }>
  >({});
  const [actionGetters, setActionGetters] = useState<
    Partial<{
      [key in CopilotMessage['type']]: ((
        data: CopilotMessage
      ) => CopilotAction[])[];
    }>
  >({});
  const [flows, setFlows] = useState<Flow<any, any>[]>([]);
  const [isReady, setIsReady] = useState(false);
  const bot = useRef(createBot());

  const { data: chats } = useChats();
  const { track } = useMetrics();

  const { data: isExpanded = false } =
    useFromCache<boolean>('CHATBOT_EXPANDED');

  const { mutate: setIsExpanded } = useSaveToCache<boolean>('CHATBOT_EXPANDED');
  const { mutate: createChat } = useCreateChat();
  const { mutate: setChatHistory } = useSaveChat(currentChatId);

  const messages = useRef<CopilotMessage[]>([]);

  const createNewChat = useCallback(
    async (newMessages?: CopilotMessage[]) => {
      const id = uuid();
      await createChat({ id, messages: newMessages || [] });
      await getChatHistory(sdk.project, id);
      setAction(undefined);
      flows.forEach((flow) => {
        flow.fields = { sdk };
      });
      setCurrentChatId((currentId) => {
        if (!currentId) {
          track('NEW_CHAT', undefined);
        }

        return id;
      });
    },
    [createChat, track, sdk, flows]
  );

  const onModeChange = useCallback(
    async (newMode: CopilotMode) => {
      setMode(newMode);
      track('MODE_CHANGE', { mode: newMode });
    },
    [setMode, track]
  );

  useEffect(() => {
    if (Array.isArray(chats) && currentChatId === '') {
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

  const addMessage = useCallback(
    async (message: CopilotMessage) => {
      messages.current.push(message);
      await setChatHistory(messages.current);
      const messageCount = messages.current.length;
      await bot.current.message.add(message, {
        ...(message.source === 'user' && {
          previous: {
            key: messageCount - 1,
            type: 'action',
            data: {},
            meta: {},
          },
        }),
        messageType: message.type,
      });
    },
    [setChatHistory, messages]
  );
  const addMessages = useCallback(
    async (newMessages: CopilotMessage[]) => {
      if (newMessages.length > 0) {
        for (const message of newMessages) {
          if (message.key === undefined) {
            await addMessage(message);
          } else {
            messages.current[message.key] = message;
            setChatHistory(messages.current);
            await bot.current.message.update(message.key, message);
          }
        }
      }
    },
    [bot, addMessage, setChatHistory]
  );

  const runFlow: CopilotRunFlowFn = useCallback(
    async (flow, input, showInChat = true, initialMessage) => {
      const defaultFields = Object.entries(
        defaultGetters[flow.constructor.name] || {}
      ).reduce((prev, [key, value]) => {
        return {
          ...prev,
          [key]: value(),
        };
      }, {} as { [key: string]: any });
      let intermediateResponse: Omit<CopilotBotResponse, 'replyTo'>;
      if (!activeFlow || flow !== activeFlow) {
        // get default fields from default getters
        flow.fields = { ...defaultFields, ...input, sdk } as any;
        setActiveFlow(flow);
        if (showInChat) {
          addMessages([
            initialMessage || {
              type: 'text',
              content: `Running "${flow.label}" ${
                'prompt' in flow.fields ? `for ${flow.fields.prompt}` : ''
              }`,
              source: 'user',
              context: flow.label,
            },
          ]);
        }
      }
      // if input is undefined, it means that we dont need to update the fields
      if (input !== undefined) {
        if (input === null) {
          // if it is null, then it should be a reset
          // get default fields from default getters
          flow!.fields = { ...defaultFields, sdk } as any; // reset fields to default values
        } else {
          flow!.fields = { ...flow!.fields, ...input, sdk } as any; // update fields with input values
        }
      }
      // if the flow has a chatRun, then we should use that
      if (flow!.chatRun) {
        const newAction = await flow!.chatRun?.(
          (message) => {
            intermediateResponse = message;
            if (showInChat) {
              addMessages([
                {
                  ...message,
                  source: 'bot',
                  replyTo:
                    messages.current.findLastIndex(
                      (el) => el.source === 'user' && el.type === 'text'
                    ) || 0,
                } as CopilotMessage,
              ]);
            }
          },
          (status) => {
            if (showInChat) {
              setLoadingStatus(status);
            }
          }
        );
        setAction(newAction);
        if (!newAction) {
          setActiveFlow(undefined);
          setLoadingStatus(undefined);
        }
        return intermediateResponse! as any;
      } else if (input) {
        return await flow!.run(input);
      }
      throw new Error(
        'Must provide a input for a flow that does not support chat (chatRun implemented)'
      );
    },
    [sdk, defaultGetters, activeFlow, setLoadingStatus, addMessages]
  );

  const registerFlow: CopilotRegisterFlowFn = useCallback((enableFlow) => {
    if (!('chatRun' in enableFlow.flow)) {
      throw new Error(
        'Must provide a input for a flow that does not support chat (chatRun implemented)'
      );
    }
    setDefaultGetters((currGetters) => {
      const { flow: currFlow, input: newInput } = enableFlow;
      return {
        ...currGetters,
        [currFlow.constructor.name]: newInput || {},
      };
    });
    setFlows((currFlows) => [...currFlows, enableFlow.flow]);
    setActionGetters((currActions) =>
      Object.entries(enableFlow.messageActions || {}).reduce(
        (prev, [key, listener]) => ({
          ...prev,
          [key]: [
            ...(currActions[key as CopilotMessage['type']] || []),
            listener,
          ],
        }),
        currActions
      )
    );
    return () => {
      // remove default getters
      setDefaultGetters((curr) => {
        const newGetters = { ...curr };
        delete newGetters[enableFlow.flow.constructor.name];
        return newGetters;
      });
      // remove flow from list of available flows
      setFlows((curr) => {
        const newFlows = [...curr];
        const index = newFlows.indexOf(enableFlow.flow);
        if (index > -1) {
          newFlows.splice(index, 1);
        }
        return newFlows;
      });
      // remove action getters
      setActionGetters((currActions) =>
        Object.entries(enableFlow.messageActions || {}).reduce(
          (prev, [key, listener]) => ({
            ...prev,
            [key]: (currActions[key as CopilotMessage['type']] || []).filter(
              (el) => el !== listener
            ),
          }),
          currActions
        )
      );
    };
  }, []);

  if (!isReady) {
    return <></>;
  }
  return (
    <CopilotContext.Provider
      value={{
        availableFlows: flows,
        registerFlow,
        runFlow,
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
        action,
        setAction,
        showChatButton,
        setShowChatButton,
        isOpen,
        setIsOpen,
        activeFlow,
        addMessages,
        actionGetters,
        isReady,
      }}
    >
      <BotUI bot={bot.current}>
        <>
          <ChatUI visible={isOpen} />
          {showChatButton && <CopilotButton />}
        </>
      </BotUI>
      {children}
    </CopilotContext.Provider>
  );
};
