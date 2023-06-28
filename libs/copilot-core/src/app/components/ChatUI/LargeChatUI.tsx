import { BotUIMessageList, BotUIAction } from '@botui/react';
import styled from 'styled-components/macro';

import { Button, Flex } from '@cognite/cogs.js';

import zIndex from '../../utils/zIndex';
import { actionRenderers } from '../ActionRenderer';
import { messageRenderers } from '../MessageRenderer';

export const LargeChatUI = ({
  setIsExpanded,
  onClose,
  onReset,
}: {
  setIsExpanded: (visible: boolean) => void;
  onClose: () => void;
  onReset: () => void;
}) => {
  return (
    <LargeChatWrapper>
      <Flex className="header" gap={6} alignItems="center">
        <div style={{ flex: 1 }} />
        <Button
          icon="ClearAll"
          aria-label="clear"
          onClick={() => onReset()}
          inverted
        />
        <Button
          icon="ScaleDown"
          aria-label="collapse"
          onClick={() => setIsExpanded(false)}
          inverted
        />
        <Button icon="Close" onClick={onClose} inverted aria-label="close" />
      </Flex>
      <>
        <Flex
          direction="column"
          style={{ overflow: 'auto', marginBottom: 8, marginTop: 8, flex: 1 }}
        >
          <BotUIMessageList renderer={messageRenderers} />
        </Flex>
        <BotUIAction renderer={actionRenderers} />
      </>
    </LargeChatWrapper>
  );
};

const LargeChatWrapper = styled(Flex)`
  z-index: ${zIndex.CHAT};
  position: fixed;
  left: 0;
  right: 0;
  max-width: 800px;
  height: 100vh;
  padding: 16px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;

  .botui_message {
    margin: 0;
    margin-bottom: 8px;
    pointer-events: all;
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
    flex-direction: column-reverse;
  }
  .botui_message_list {
    padding: 0;
    flex: 1;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex-direction: column;
    > div {
      overflow: auto;
      align-self: end;
      width: 100%;
      overflow: auto;
    }
  }
  .botui_action_container {
    padding: 0;
    margin-bottom: 120px;
    margin-top: 32px;
    min-height: 104px;
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
`;
