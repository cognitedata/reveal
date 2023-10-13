import { ResizableBox } from 'react-resizable';

import styled from 'styled-components';

import { BotUIMessageList, BotUIAction } from '@botui/react';

import { Button, Flex, Icon } from '@cognite/cogs.js';

import { useFromCache, useSaveToCache } from '../../hooks/useCache';
import { useCopilotContext } from '../../hooks/useCopilotContext';
import { useMetrics } from '../../hooks/useMetrics';
import zIndex from '../../utils/zIndex';
import { messageRenderers } from '../MessageRenderer';
import { actionRenderers } from '../UserActionRenderer';

import { ChatHeader } from './ChatHeader';
import { HistoryList } from './HistoryList';
import { LoadingMessage } from './LoadingMessage';

const MAX_WIDTH = window.innerWidth - 120;
const MAX_HEIGHT = window.innerHeight - 120;

export const SmallChatUI = ({
  setShowOverlay,
}: {
  setShowOverlay: (visible: boolean) => void;
}) => {
  const { mode } = useCopilotContext();

  const { data: dimensions, isLoading } = useFromCache<{
    width: number;
    height: number;
  }>('SMALL_CHATBOT_DIMENTIONS');

  const { width, height } =
    dimensions &&
    // make sure the dimensions are not bigger than the screen
    dimensions.width <= MAX_WIDTH &&
    dimensions.height <= MAX_HEIGHT
      ? dimensions
      : {
          width: 320,
          height: 400,
        };

  const { mutate: saveToCache } = useSaveToCache<{
    width: number;
    height: number;
  }>('SMALL_CHATBOT_DIMENTIONS');

  const { track } = useMetrics();

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <SmallChatBotWrapper
      width={width}
      height={height}
      minConstraints={[320, 400]}
      maxConstraints={[MAX_WIDTH, MAX_HEIGHT]}
      resizeHandles={['nw']}
      onResizeStart={() => setShowOverlay(true)}
      onResizeStop={(_e, data) => {
        track('RESIZE', { size: [data.size.width, data.size.height] });
        setShowOverlay(false);
        saveToCache(data.size);
        window.dispatchEvent(new Event('small-resize'));
      }}
      handle={
        <Button
          className="react-resizable-handle react-resizable-handle-nw"
          icon="Expand"
          type="secondary"
          aria-label="expand"
        />
      }
    >
      <ChatHeader style={{ padding: 16 }} />
      {mode === 'chat' ? (
        <>
          <Flex
            direction="column-reverse"
            style={{ overflow: 'auto', flex: 1 }}
          >
            <LoadingMessage />
            <BotUIMessageList renderer={messageRenderers} />
          </Flex>
          <BotUIAction renderer={actionRenderers} />
        </>
      ) : (
        <HistoryList />
      )}
    </SmallChatBotWrapper>
  );
};

const SmallChatBotWrapper = styled(ResizableBox)`
  && {
    z-index: ${zIndex.CHAT};
    position: fixed;
    bottom: 70px;
    right: 10px;
    background: #fff;
    margin-top: 16px;
    border-radius: 10px;
    box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
      0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
    display: flex;
    flex-direction: column;

    .react-resizable-handle-nw {
      position: absolute;
      background-image: none;
      transform: translate(-50%, -50%) rotate(90deg);
      width: auto;
      height: auto;
      background: #fff !important;
      opacity: 0;
      transition: 0.3s all;
      border-radius: 50%;
      box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
        0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
      cursor: nw-resize;
    }
    .react-resizable-handle:hover {
      opacity: 1;
    }
  }
`;
