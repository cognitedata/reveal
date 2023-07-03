/* eslint-disable testing-library/await-async-utils */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import styled from 'styled-components';

import { useBotUI } from '@botui/react';
import { BotuiInterface } from 'botui';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { AIChatMessage, HumanChatMessage } from 'langchain/schema';

import { Flex } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';

import { CogniteChatGPT } from '../../../lib/chatModels';
import { processMessage } from '../../../lib/processMessage';
import { newChain } from '../../../lib/toolchains';
import {
  CopilotBotMessage,
  CopilotMessage,
  CopilotSupportedFeatureType,
} from '../../../lib/types';
import {
  addToCopilotEventListener,
  cachedListeners,
  sendToCopilotEvent,
} from '../../../lib/utils';
import {
  getFromCache,
  useFromCache,
  useSaveToCache,
} from '../../hooks/useCache';
import zIndex from '../../utils/zIndex';

import { LargeChatUI } from './LargeChatUI';
import { SmallChatUI } from './SmallChatUI';

export const ChatUI = ({
  visible,
  onClose,
  feature,
}: {
  visible: boolean;
  onClose: () => void;
  feature?: CopilotSupportedFeatureType;
}) => {
  const { isEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
    forceRerender: true,
  });
  const bot = useBotUI();
  const sdk = useSDK();
  const messages = useRef<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: setChatHistory } =
    useSaveToCache<CopilotMessage[]>('CHAT_HISTORY');

  const model = useMemo(() => new CogniteChatGPT(sdk), [sdk]);

  const conversationChain = useMemo(() => {
    return newChain(sdk, model, messages);
  }, [sdk, model, messages]);

  const updateMessage = useCallback(
    async (key: number, result: CopilotBotMessage) => {
      sendToCopilotEvent('NEW_MESSAGES', [
        { key: key, source: 'bot', ...result },
      ]);
    },
    []
  );

  const addMessage = useCallback(
    async (chatBot: BotuiInterface, message: CopilotMessage) => {
      messages.current.push(message);
      await setChatHistory(messages.current);
      const messageCount = messages.current.length;
      await chatBot.message.add(message, {
        ...(message.source === 'user' && {
          previous: {
            key: messageCount - 1,
            type: 'action',
            data: {},
            meta: {},
          },
        }),
        messageType: message.type,
        updateMessage,
      });
    },
    [setChatHistory, updateMessage]
  );

  const promptUser = useCallback(() => {
    bot.action
      .set({ feature }, { actionType: 'text', feature })
      .then(async ({ content }: { content: string }) => {
        messages.current.push({
          content: content,
          type: 'text',
          source: 'user',
        });
        setChatHistory(messages.current);
        processMessage(
          feature,
          conversationChain,
          sdk,
          content,
          messages.current,
          (message) => addMessage(bot, { ...message, source: 'bot' })
        ).then((shouldPrompt) => {
          if (shouldPrompt) {
            promptUser();
          }
        });
        if (messages.current.length > 0) {
          await bot.wait();
        }
      });
  }, [addMessage, bot, conversationChain, feature, sdk, setChatHistory]);

  useEffect(() => {
    if (isEnabled) {
      const removeListener = addToCopilotEventListener(
        'NEW_MESSAGES',
        async (newMessages) => {
          if (newMessages.length > 0) {
            for (const message of newMessages) {
              if (message.key === undefined) {
                await addMessage(bot, message);
              } else {
                messages.current[message.key] = message;
                setChatHistory(messages.current);
                await bot.message.update(message.key, message);
              }
            }
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.source === 'user') {
              bot.wait();
              processMessage(
                feature,
                conversationChain,
                sdk,
                lastMessage.content,
                messages.current,
                (message) => addMessage(bot, { ...message, source: 'bot' })
              ).then((shouldPrompt) => {
                if (shouldPrompt) {
                  promptUser();
                }
              });
            }
          }
        }
      );
      return () => {
        removeListener();
        for (const listener of cachedListeners) {
          window.removeEventListener(listener.event, listener.listener);
        }
      };
    }
  }, [
    isEnabled,
    bot,
    addMessage,
    setChatHistory,
    promptUser,
    feature,
    sdk,
    conversationChain,
  ]);

  const setupMessages = useCallback(
    async (newMessages?: CopilotMessage[]) => {
      setIsLoading(true);
      const cachedMessages =
        newMessages ||
        (await getFromCache<CopilotMessage[]>(sdk.project, 'CHAT_HISTORY'));
      messages.current = [];
      messages.current.push(...(cachedMessages || []));
      await bot.message.removeAll();
      await bot.message.setAll(
        (cachedMessages || []).map((el, i) => ({
          ...el,
          key: i,
          type: el.type,
          meta: {
            updateMessage,
            messageType: el.type,
            ...(el.source === 'user' && {
              previous: {
                key: i,
                type: 'action',
                data: {},
                meta: {},
              },
            }),
          },
          data: el,
        }))
      );
      conversationChain.defaultChain.memory = new BufferMemory({
        chatHistory: new ChatMessageHistory(
          cachedMessages?.map((el) =>
            el.source === 'user'
              ? new HumanChatMessage(el.content)
              : new AIChatMessage(el.content)
          )
        ),
      });
      if (messages.current.length === 0) {
        processMessage(
          feature,
          conversationChain,
          sdk,
          '',
          messages.current,
          (message) => addMessage(bot, { ...message, source: 'bot' })
        ).then((shouldPrompt) => {
          if (shouldPrompt) {
            promptUser();
          }
        });
      } else {
        promptUser();
      }
      setIsLoading(false);
    },
    [
      promptUser,
      feature,
      conversationChain,
      sdk,
      addMessage,
      bot,
      updateMessage,
    ]
  );

  useEffect(() => {
    setupMessages();
  }, [setupMessages]);

  if (!visible || isLoading) {
    return <></>;
  }
  return <ChatUIInner onClose={onClose} setupMessages={setupMessages} />;
};

const ChatUIInner = ({
  onClose,
  setupMessages,
}: {
  onClose: () => void;
  chains?: string[];
  setupMessages: (messages: CopilotMessage[]) => void;
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const { data: isExpanded = false } =
    useFromCache<boolean>('CHATBOT_EXPANDED');

  const { mutate: setIsExpanded } = useSaveToCache<boolean>('CHATBOT_EXPANDED');

  const { mutate: setChatHistory } =
    useSaveToCache<CopilotMessage[]>('CHAT_HISTORY');

  const onReset = useCallback(async () => {
    await setChatHistory([]);
    await setupMessages([]);
  }, [setupMessages, setChatHistory]);

  return (
    <>
      <Overlay
        $showOverlay={showOverlay}
        $isExpanded={!!isExpanded}
        onClick={() => setIsExpanded(false)}
      />
      {isExpanded ? (
        <LargeChatUI
          onClose={onClose}
          setIsExpanded={setIsExpanded}
          onReset={onReset}
        />
      ) : (
        <SmallChatUI
          setShowOverlay={setShowOverlay}
          onReset={onReset}
          onClose={onClose}
          setIsExpanded={setIsExpanded}
        />
      )}
    </>
  );
};

const Overlay = styled(Flex)<{ $showOverlay: boolean; $isExpanded: boolean }>`
  position: fixed;
  height: 100vh;
  width: 100vw;
  left: 0;
  transition: 0.3s backdrop-filter;
  backdrop-filter: ${(props) =>
    props.$showOverlay || props.$isExpanded
      ? 'blur(10px) opacity(1)'
      : 'blur(10px) opacity(0)'};

  z-index: ${zIndex.OVERLAY};
  display: block;
  pointer-events: ${(props) =>
    props.$showOverlay || props.$isExpanded ? 'all' : 'none'};
`;
