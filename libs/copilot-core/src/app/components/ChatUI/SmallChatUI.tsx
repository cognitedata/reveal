import { ResizableBox } from 'react-resizable';

import { BotUIMessageList, BotUIAction } from '@botui/react';
import styled from 'styled-components/macro';

import { Button, Flex, Icon } from '@cognite/cogs.js';

import { useFromCache, useSaveToCache } from '../../hooks/useCache';
import zIndex from '../../utils/zIndex';
import { actionRenderers } from '../ActionRenderer';
import { messageRenderers } from '../MessageRenderer';

const MAX_WIDTH = window.innerWidth - 120;
const MAX_HEIGHT = window.innerHeight - 120;

export const SmallChatUI = ({
  setIsExpanded,
  setShowOverlay,
  onClose,
  onReset,
}: {
  setShowOverlay: (visible: boolean) => void;
  setIsExpanded: (visible: boolean) => void;
  onClose: () => void;
  onReset: () => void;
}) => {
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
        setShowOverlay(false);
        saveToCache(data.size);
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
      <Button
        icon="ScaleUp"
        aria-label="full screen"
        onClick={() => setIsExpanded(true)}
        className="react-resizable-handle react-resizable-handle-nw"
        style={{
          left: 48,
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
        }}
      />
      <Button
        icon="ClearAll"
        aria-label="reset"
        onClick={() => onReset()}
        className="react-resizable-handle react-resizable-handle-nw"
        style={{
          left: 98,
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
        }}
      />
      <Flex className="header" gap={6} alignItems="center">
        <div style={{ flex: 1 }} />
        <Button
          icon="Close"
          type="ghost"
          onClick={onClose}
          aria-label="close"
        />
      </Flex>
      <Flex
        direction="column"
        style={{ overflow: 'auto', marginBottom: 8, flex: 1 }}
      >
        <BotUIMessageList renderer={messageRenderers} />
      </Flex>
      <BotUIAction renderer={actionRenderers} />
    </SmallChatBotWrapper>
  );
};

const SmallChatBotWrapper = styled(ResizableBox)`
  z-index: ${zIndex.CHAT};
  position: fixed;
  bottom: 70px;
  right: 10px;
  background: #fff;
  margin-top: 16px;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
  display: flex;
  flex-direction: column;

  .react-resizable-handle-nw {
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
  &&:hover {
    .react-resizable-handle-nw {
      opacity: 1;
    }
  }
`;
