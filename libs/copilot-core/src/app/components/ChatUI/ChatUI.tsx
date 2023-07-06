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
import { CogniteChainName, newChain } from '../../../lib/toolchains';
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
import { getChatHistory, useSaveChat } from '../../hooks/useChatHistory';
import { useCopilotContext } from '../../utils/CopilotContext';
import zIndex from '../../utils/zIndex';

import { LargeChatUI } from './LargeChatUI';
import { SmallChatUI } from './SmallChatUI';

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
  const messages = useRef<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { currentChatId } = useCopilotContext();

  const { mutate: setChatHistory } = useSaveChat(currentChatId);

  const model = useMemo(() => new CogniteChatGPT(sdk), [sdk]);

  const conversationChain = useMemo(() => {
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
        chatHistory: new ChatMessageHistory(
          cachedMessages?.map((el) =>
            el.source === 'user'
              ? new HumanChatMessage(el.content)
              : new AIChatMessage(el.content)
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
    (async () => {
      setIsLoading(true);
      setupMessages(
        (await getChatHistory(sdk.project, currentChatId))?.history || []
      );
      setTimeout(() => setIsLoading(false), 100);
    })();
  }, [currentChatId]);

  if (!visible || isLoading) {
    return <></>;
  }
  return <ChatUIInner />;
};

const ChatUIInner = () => {
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

  /*
Animation of loading dots
*/
  .loading_dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 0.5rem;
    display: inline-block;
    background-color: $primary-color;

    &:nth-last-child(1) {
      margin-left: 0.3rem;
      animation: loading 0.6s 0.3s linear infinite;
    }
    &:nth-last-child(2) {
      margin-left: 0.3rem;
      animation: loading 0.6s 0.2s linear infinite;
    }
    &:nth-last-child(3) {
      animation: loading 0.6s 0.1s linear infinite;
    }
  }

  @keyframes loading {
    0% {
      transform: translate(0, 0);
      background-color: $primary-color;
    }

    25% {
      transform: translate(0, -3px);
    }
    50% {
      transform: translate(0, 0px);
      background-color: $primary-color;
    }
    75% {
      transform: translate(0, 3px);
    }
    100% {
      transform: translate(0, 0px);
    }
  }

  .slide-fade-enter-done {
    transition: all 0.3s ease;
  }

  .slide-fade-enter,
  .slide-fade-exit-done {
    opacity: 0;
    transform: translateX(-10px);
  }
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
