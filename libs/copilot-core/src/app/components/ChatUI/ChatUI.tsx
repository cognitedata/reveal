/* eslint-disable testing-library/await-async-utils */
import { useState, useEffect, useCallback } from 'react';

import styled, { css } from 'styled-components';

import { useBotUI } from '@botui/react';

import { Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { CopilotMessage } from '../../../lib/types';
import { getChatHistory, useSaveChat } from '../../hooks/useChatHistory';
import { useCopilotContext } from '../../hooks/useCopilotContext';
import { useMetrics } from '../../hooks/useMetrics';
import { scrollToBottom } from '../../utils/scrollToBottom';
import zIndex from '../../utils/zIndex';

import { LargeChatUI } from './LargeChatUI';
import { SmallChatUI } from './SmallChatUI';

export const ChatUI = ({ visible }: { visible: boolean }) => {
  const bot = useBotUI();
  const sdk = useSDK();
  const { action, runFlow, activeFlow } = useCopilotContext();
  const [isLoading, setIsLoading] = useState(false);

  const { currentChatId, messages, loadingStatus, addMessages } =
    useCopilotContext();

  const { mutate: setChatHistory } = useSaveChat(currentChatId);

  const { track } = useMetrics();

  useEffect(() => {
    setTimeout(scrollToBottom, 400);
  }, [loadingStatus]);

  useEffect(() => {
    bot.action
      .set({}, { actionType: action?.type || 'chain', action })
      .then((value) => {
        track('USER_PROMPT', undefined);
        messages.current.push(value);
        setChatHistory(messages.current);
        try {
          action?.onNext(value);
        } catch (e: any) {
          addMessages([
            {
              type: 'error',
              content: (e as Error).message,
              source: 'bot',
              replyTo: messages.current.length - 1,
            },
          ]);
          console.error(e);
        }
        if (activeFlow) {
          runFlow(activeFlow);
        }
      });
    setTimeout(() => {
      scrollToBottom();
    }, 400);
  }, [
    action,
    bot,
    runFlow,
    activeFlow,
    messages,
    track,
    setChatHistory,
    addMessages,
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
    },
    [bot, messages]
  );

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setupMessages(
        (await getChatHistory(sdk.project, currentChatId))?.history || []
      );
      setTimeout(() => {
        setIsLoading(false);
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
  --cogs-themed-surface--action--strong--default: #6f3be4;
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
