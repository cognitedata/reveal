import { ResizableBox } from 'react-resizable';

import { BotUIMessageList, BotUIAction } from '@botui/react';
import styled from 'styled-components/macro';

import { Button, Flex, Icon } from '@cognite/cogs.js';

import { useFromCache, useSaveToCache } from '../../hooks/useCache';
import zIndex from '../../utils/zIndex';
import { actionRenderers } from '../ActionRenderer';
import { messageRenderers } from '../MessageRenderer';

export const SmallChatUI = ({
  setIsExpanded,
  setShowOverlay,
  onClose,
}: {
  setShowOverlay: (visible: boolean) => void;
  setIsExpanded: (visible: boolean) => void;
  onClose: () => void;
}) => {
  const { data: { width, height } = { width: 320, height: 400 }, isLoading } =
    useFromCache<{
      width: number;
      height: number;
    }>('SMALL_CHATBOT_DIMENTIONS');

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
        />
      }
    >
      <Button
        icon="ScaleUp"
        onClick={() => setIsExpanded(true)}
        className="react-resizable-handle react-resizable-handle-nw"
        style={{
          left: 48,
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
        }}
      />
      <Flex className="header" gap={6} alignItems="center">
        <div style={{ flex: 1 }} />
        <Button icon="Close" type="ghost" onClick={onClose} />
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

  .botui_message {
    margin: 0;
    margin-bottom: 8px;
  }
  .botui_message_content {
    overflow: auto;
  }
  .botui_app_container {
    width: 100%;
    overflow: hidden;
    flex: 1;
    position: relative;
    display: flex;
  }
  .botui_container {
    height: auto;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .botui_message_list {
    padding: 0;
    width: 100%;
    > div {
      /* height: 100%;
      overflow: auto; */
    }
  }
  .botui_action_container {
    padding: 0;
    .botui_action {
      padding: 0;
    }
  }
  .cogs-textarea {
    flex: 1;
    height: 100px;
  }
  .botui_message_content {
    background: #dadffc;
  }
  .botui_message_content.human {
    background: #f5f5f5;
  }
  .cogs-textarea {
    width: 100%;
    textarea {
      color: black !important;
    }
  }
  pre {
    overflow: hidden;
    margin-bottom: 0;
  }
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
