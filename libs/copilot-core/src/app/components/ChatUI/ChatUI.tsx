/* eslint-disable testing-library/await-async-utils */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import styled from 'styled-components';

import { BotUI } from '@botui/react';
import { BotuiInterface, createBot } from 'botui';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { AIChatMessage, HumanChatMessage } from 'langchain/schema';

import { Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { CogniteChatGPT } from '../../../lib/chatModels';
import { processMessage } from '../../../lib/processMessage';
import { newChain } from '../../../lib/toolchains';
import {
  CopilotBotMessage,
  CopilotMessage,
  CopilotSupportedFeatureType,
} from '../../../lib/types';
import { addFromCopilotEventListener } from '../../../lib/utils';
import {
  getFromCache,
  useFromCache,
  useSaveToCache,
} from '../../hooks/useCache';
import zIndex from '../../utils/zIndex';

import { LargeChatUI } from './LargeChatUI';
import { SmallChatUI } from './SmallChatUI';

export const ChatUI = ({
  onClose,
  feature,
}: {
  onClose: () => void;
  feature?: CopilotSupportedFeatureType;
}) => {
  const bot = useRef(createBot());

  return (
    <BotUI bot={bot.current}>
      <ChatUIInner bot={bot.current} onClose={onClose} feature={feature} />
    </BotUI>
  );
};

const ChatUIInner = ({
  bot,
  onClose,
  feature,
}: {
  bot: BotuiInterface;
  onClose: () => void;
  feature?: CopilotSupportedFeatureType;
  chains?: string[];
}) => {
  const sdk = useSDK();
  const messages = useRef<CopilotMessage[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: isExpanded = false } =
    useFromCache<boolean>('CHATBOT_EXPANDED');

  const { mutate: setIsExpanded } = useSaveToCache<boolean>('CHATBOT_EXPANDED');

  const { mutate: setChatHistory } =
    useSaveToCache<CopilotMessage[]>('CHAT_HISTORY');

  const model = useMemo(() => new CogniteChatGPT(sdk), [sdk]);

  const conversationChain = useMemo(() => {
    return newChain(sdk, model);
  }, [sdk, model]);

  const addMessageForBot = useCallback(
    async (chatBot: BotuiInterface, result: CopilotBotMessage) => {
      messages.current.push({ ...result, source: 'bot' });
      setChatHistory(messages.current);
      await chatBot.message.add(result, { messageType: result.type });
    },
    [setChatHistory]
  );

  useEffect(() => {
    const removeListener = addFromCopilotEventListener(
      'NEW_BOT_MESSAGE',
      (message) => {
        addMessageForBot(bot, message);
      }
    );
    return removeListener;
  }, [bot, addMessageForBot]);

  const setupMessages = useCallback(
    async (newMessages?: CopilotMessage[]) => {
      setIsLoading(true);
      const cachedMessages =
        newMessages ||
        (await getFromCache<CopilotMessage[]>(sdk.project, 'CHAT_HISTORY'));
      console.log(cachedMessages);
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
      conversationChain.memory = new BufferMemory({
        chatHistory: new ChatMessageHistory(
          cachedMessages?.map((el) =>
            el.source === 'user'
              ? new HumanChatMessage(el.content)
              : new AIChatMessage(el.content)
          )
        ),
      });
      const promptUser = () => {
        bot.action
          .set({ feature }, { actionType: 'text', feature })
          .then(({ content }: { content: string }) => {
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
              (message) => addMessageForBot(bot, message)
            ).then((shouldPrompt) => {
              if (shouldPrompt) {
                promptUser();
              }
            });
            if (messages.current.length > 0) {
              bot.wait();
            }
          });
      };
      if (messages.current.length === 0) {
        processMessage(
          feature,
          conversationChain,
          sdk,
          '',
          messages.current,
          (message) => addMessageForBot(bot, message)
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
    [setChatHistory, feature, bot, conversationChain, addMessageForBot, sdk]
  );

  const onReset = useCallback(async () => {
    await setChatHistory([]);
    await setupMessages([]);
  }, [setupMessages, setChatHistory]);

  useEffect(() => {
    setupMessages();
  }, [setupMessages]);

  if (isLoading) {
    return <></>;
  }

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
