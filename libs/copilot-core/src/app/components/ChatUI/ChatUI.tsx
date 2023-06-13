import { useState, useEffect, useCallback, useRef } from 'react';

import styled from 'styled-components';

import { BotUI } from '@botui/react';
import { BotuiInterface, createBot } from 'botui';

import { Flex } from '@cognite/cogs.js';

import { processMessage } from '../../../lib/processMessage';
import {
  CopilotBotMessage,
  CopilotMessage,
  CopilotSupportedFeatureType,
} from '../../../lib/types';
import zIndex from '../../utils/zIndex';

import { LargeChatUI } from './LargetChatUI';
import { SmallChatUI } from './SmallChatUI';

export const ChatUI = ({
  onClose,
  feature,
}: {
  onClose: () => void;
  feature: CopilotSupportedFeatureType;
}) => {
  const messages = useRef<CopilotMessage[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [bot, setBot] = useState<BotuiInterface | undefined>();

  const addMessageForBot = useCallback(
    async (chatBot: BotuiInterface, result: CopilotBotMessage) => {
      messages.current.push({ ...result, source: 'bot' });
      await chatBot.message.add(result, { messageType: result.type });
      // because linters think this is some special async func, but is actually just a wait function
      // eslint-disable-next-line testing-library/await-async-utils
      chatBot.wait();
    },
    []
  );

  useEffect(() => {
    setTimeout(() => {
      const newBot = createBot();
      newBot.wait({ waitTime: 100 }).then(() => {
        setBot(newBot);
      });
    }, 100);
  }, []);

  useEffect(() => {
    if (bot) {
      const promptUser = () => {
        bot.action
          .set({ feature }, { actionType: 'text', feature })
          .then(({ content }: { content: string }) => {
            messages.current.push({
              content: content,
              type: 'text',
              source: 'user',
            });
            processMessage(feature, content, messages.current, (message) =>
              addMessageForBot(bot, message)
            ).then((shouldPrompt) => {
              if (shouldPrompt) {
                promptUser();
              }
            });
            // because linters think this is some special async func, but is actually just a wait function
            // eslint-disable-next-line testing-library/await-async-utils
            bot.wait();
          });
      };
      processMessage(feature, '', messages.current, (message) =>
        addMessageForBot(bot, message)
      ).then((shouldPrompt) => {
        if (shouldPrompt) {
          promptUser();
        }
      });
    }
  }, [bot, feature, addMessageForBot]);

  console.log(bot);
  if (!bot) {
    return <></>;
  }

  return (
    <>
      <Overlay
        showOverlay={showOverlay}
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(false)}
      />
      <BotUI bot={bot}>
        {isExpanded ? (
          <LargeChatUI onClose={onClose} setIsExpanded={setIsExpanded} />
        ) : (
          <SmallChatUI
            setShowOverlay={setShowOverlay}
            onClose={onClose}
            setIsExpanded={setIsExpanded}
          />
        )}
      </BotUI>
    </>
  );
};

const Overlay = styled(Flex)<{ showOverlay: boolean; isExpanded: boolean }>`
  position: fixed;
  height: 100%;
  width: 100%;
  transition: 0.3s backdrop-filter;
  backdrop-filter: ${(props) =>
    props.showOverlay || props.isExpanded
      ? 'blur(10px) opacity(1)'
      : 'blur(10px) opacity(0)'};

  z-index: ${zIndex.OVERLAY};
  display: block;
  pointer-events: ${(props) =>
    props.showOverlay || props.isExpanded ? 'all' : 'none'};
`;
