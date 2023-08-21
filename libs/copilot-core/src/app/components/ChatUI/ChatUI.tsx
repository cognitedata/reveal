/* eslint-disable testing-library/await-async-utils */
import { useState, useEffect, useCallback, useMemo } from 'react';

import styled, { css } from 'styled-components';

import { useBotUI } from '@botui/react';
import { BotuiInterface } from 'botui';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { AIMessage, HumanMessage } from 'langchain/schema';
import noop from 'lodash/noop';

import { Flex } from '@cognite/cogs.js';
import { datamodelResultSummaryPrompt } from '@cognite/llm-hub';
import { useFlag } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';

import { CogniteChatGPT } from '../../../lib/chatModels';
import {
  callPromptChain,
  safeConvertToJson,
} from '../../../lib/CogniteBaseChain';
import { processMessage } from '../../../lib/processMessage';
import { CogniteChainName, newChain } from '../../../lib/toolchains';
import {
  CopilotBotMessage,
  CopilotMessage,
  CopilotSupportedFeatureType,
} from '../../../lib/types';
import {
  addToCopilotEventListener,
  cachedListeners,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../../lib/utils';
import { getChatHistory, useSaveChat } from '../../hooks/useChatHistory';
import { useCopilotContext } from '../../hooks/useCopilotContext';
import { useMetrics } from '../../hooks/useMetrics';
import zIndex from '../../utils/zIndex';

import { LargeChatUI } from './LargeChatUI';
import { SmallChatUI } from './SmallChatUI';

const scrollToBottom = () => {
  const messagesDiv = document.querySelector('.botui_message_list');
  if (messagesDiv) {
    if (messagesDiv.parentElement) {
      messagesDiv.parentElement.scrollTop = messagesDiv.scrollHeight;
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};

export const ChatUI = ({
  visible,
  feature,
  excludeChains,
}: {
  visible: boolean;
  feature?: CopilotSupportedFeatureType;
  excludeChains: CogniteChainName[];
}) => {
  const { isEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
    forceRerender: true,
  });
  const bot = useBotUI();
  const sdk = useSDK();
  const [isLoading, setIsLoading] = useState(false);

  const { currentChatId, setLoadingStatus, messages } = useCopilotContext();

  const { mutate: setChatHistory } = useSaveChat(currentChatId);

  const { track } = useMetrics();

  const model = useMemo(() => new CogniteChatGPT(sdk), [sdk]);

  const { base: conversationChain, chains } = useMemo(() => {
    return newChain(sdk, model, messages, excludeChains);
  }, [sdk, model, messages, excludeChains]);

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
    [setChatHistory, updateMessage, messages]
  );

  const promptUser = useCallback(() => {
    setLoadingStatus('');
    bot.action
      .set({ feature }, { actionType: 'text', feature })
      .then(async ({ content }: { content: string }) => {
        track('USER_PROMPT', undefined);
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
          messages.current
        ).then((shouldPrompt) => {
          if (shouldPrompt) {
            promptUser();
          }
        });
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        if (messages.current.length > 0) {
          await bot.wait();
        }
      });
  }, [
    bot,
    track,
    conversationChain,
    feature,
    sdk,
    setChatHistory,
    setLoadingStatus,
    messages,
  ]);

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
              let message = lastMessage.content;
              if (lastMessage.context) {
                if (lastMessage.context.includes('Explorer')) {
                  message = `${lastMessage.content} ${
                    lastMessage.context ? ' via graphql' : ''
                  }`;
                }
              }
              bot.wait();
              processMessage(
                feature,
                conversationChain,
                sdk,
                message,
                messages.current
              ).then((shouldPrompt) => {
                if (shouldPrompt) {
                  promptUser();
                }
              });
            }
          }
        }
      );
      const removeListener2 = addToCopilotEventListener(
        'SUMMARIZE_QUERY',
        async (graphql) => {
          const [{ summary }] = await callPromptChain(
            chains.GraphQlChain,
            'summarize filter',
            datamodelResultSummaryPrompt,
            [
              {
                query: JSON.stringify(graphql),
              },
            ]
          ).then(
            safeConvertToJson<{
              summary: string;
            }>
          );
          sendFromCopilotEvent('SUMMARIZE_QUERY', { summary });
        }
      );
      return () => {
        removeListener();
        removeListener2();
        for (const listener of cachedListeners) {
          window.removeEventListener(listener.event, listener.listener);
        }
      };
    }
    return noop;
  }, [
    isEnabled,
    bot,
    addMessage,
    setChatHistory,
    promptUser,
    feature,
    sdk,
    conversationChain,
    messages,
    chains,
  ]);

  const setupMessages = useCallback(
    async (newMessages: CopilotMessage[]) => {
      const cachedMessages = newMessages;
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
      const memory = new BufferMemory({
        inputKey: 'input',
        chatHistory: new ChatMessageHistory(
          cachedMessages?.map((el) =>
            el.source === 'user'
              ? new HumanMessage(el.content)
              : new AIMessage(el.content)
          )
        ),
      });
      [
        ...Object.values(conversationChain.destinationChains),
        conversationChain.defaultChain,
        conversationChain,
      ].forEach((el) => {
        el.memory = memory;
      });
      if (messages.current.length === 0) {
        processMessage(
          feature,
          conversationChain,
          sdk,
          '',
          messages.current
        ).then((shouldPrompt) => {
          if (shouldPrompt) {
            promptUser();
          }
        });
      } else {
        promptUser();
      }
    },
    [promptUser, feature, conversationChain, sdk, bot, updateMessage, messages]
  );

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setupMessages(
        (await getChatHistory(sdk.project, currentChatId))?.history || []
      );
      setTimeout(() => {
        setIsLoading(false);
        sendFromCopilotEvent('CHAT_READY', undefined);
      }, 100);
    })();
  }, [currentChatId, sdk.project, setupMessages]);

  if (!visible || isLoading) {
    return <></>;
  }
  return <ChatUIInner />;
};

export const ChatUIInner = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  const { setIsExpanded, isExpanded } = useCopilotContext();

  return (
    <Wrapper>
      <Overlay
        $showOverlay={showOverlay}
        $isExpanded={!!isExpanded}
        onClick={() => setIsExpanded(false)}
      />
      {isExpanded ? (
        <LargeChatUI />
      ) : (
        <SmallChatUI setShowOverlay={setShowOverlay} />
      )}
    </Wrapper>
  );
};

export const CopilotPurpleOverride = css`
  .cogs-button.ai {
    background: rgba(111, 59, 228, 0.08);
    color: #6f3be4;
  }
  .cogs-button.ai.cogs-button--disabled {
    background: transparent;
    color: #6f3be4;
    opacity: 0.5;
  }
  .cogs-button.ai.cogs-button--disabled.selected {
    opacity: 1;
  }
  .cogs-button.ai.cogs-button--disabled:hover {
    background: none;
  }
  .cogs-button.ai:hover {
    background: rgba(111, 59, 228, 0.18);
    color: #6f3be4;
  }

  --cogs-surface--action--strong--hover: #632cd4;
  --cogs-surface--action--strong--default: #6f3be4;
`;

const Wrapper = styled.div`
  .botui_action {
    width: 100%;
    max-width: 100%;
    padding: 7px 14px;
    display: inline-block;

    &.action_input {
      form {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .botui_message_container {
    width: 100%;
  }

  .botui_message {
    display: flex;
    flex-direction: column;
  }

  .botui_message_content {
    padding: 16px;
    width: 100%;
    overflow: scroll;
    display: inline-block;
    overflow: auto;
    background: rgba(153, 137, 250, 0.08);
    overflow: auto;

    &.human {
      background: rgba(255, 255, 255, 0.08);
    }

    iframe {
      border: 0;
      width: 100%;
    }
  }

  .botui_app_container {
    width: 100%; // mobile-first
    height: 100%;
    line-height: 1;

    @media (min-width: $botui-width) {
      height: 500px;
      margin: 0 auto;
      width: $botui-width;
    }
  }

  .botui_container {
    width: 100%;
    height: auto;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .botui_app_container {
    width: 100%;
    overflow: hidden;
    flex: 1;
    position: relative;
    display: flex;
  }
  .botui_message_list {
    padding: 0;
    width: 100%;
  }

  .botui_action_container {
    padding: 0;
    .botui_action {
      padding: 0;
    }
  }
  pre {
    overflow: hidden;
    margin-bottom: 0;
  }

  .slide-fade-enter-done {
    transition: all 0.3s ease;
  }

  .slide-fade-enter,
  .slide-fade-exit-done {
    opacity: 0;
    transform: translateX(-10px);
  }
  ${CopilotPurpleOverride}
`;

const Overlay = styled(Flex)<{ $showOverlay: boolean; $isExpanded: boolean }>`
  position: fixed;
  height: 100vh;
  width: 100vw;
  left: 0;
  transition: 0.3s all;
  backdrop-filter: ${(props) =>
    props.$showOverlay || props.$isExpanded
      ? 'blur(10px) opacity(1)'
      : 'blur(10px) opacity(0)'};

  background: ${(props) =>
    props.$showOverlay || props.$isExpanded ? 'rgba(255, 255, 255, 0.9)' : ''};
  z-index: ${zIndex.OVERLAY};
  display: block;
  pointer-events: ${(props) =>
    props.$showOverlay || props.$isExpanded ? 'all' : 'none'};
`;
