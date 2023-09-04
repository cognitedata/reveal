import styled from 'styled-components';

import { BotUIMessageList, BotUIAction } from '@botui/react';

import { Flex } from '@cognite/cogs.js';

import zIndex from '../../utils/zIndex';
import { actionRenderers } from '../ActionRenderer';
import { messageRenderers } from '../MessageRenderer';

import { ChatHeader } from './ChatHeader';
import { HistoryList } from './HistoryList';
import { LoadingMessage } from './LoadingMessage';

export const LargeChatUI = () => {
  return (
    <LargeChatWrapper>
      <ChatHeader style={{ paddingTop: 16, paddingBottom: 16 }} hideHistory />
      <Flex style={{ flex: 1, overflow: 'hidden' }} gap={16}>
        <div
          style={{
            overflow: 'auto',
            width: 280,
            height: '100%',
            paddingRight: 16,
            borderRight: '1px solid #e5e5e5',
          }}
        >
          <HistoryList />
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <Flex
            style={{
              overflow: 'hidden',
              height: '100%',
            }}
            direction="column"
          >
            <Flex
              direction="column"
              style={{
                overflow: 'auto',
                marginBottom: 8,
                marginTop: 8,
                flex: 1,
              }}
            >
              <BotUIMessageList renderer={messageRenderers} />
              <LoadingMessage />
            </Flex>
            <BotUIAction renderer={actionRenderers} />
          </Flex>
        </div>
      </Flex>
    </LargeChatWrapper>
  );
};

const LargeChatWrapper = styled(Flex)`
  z-index: ${zIndex.CHAT};
  position: fixed;
  left: 0;
  right: 0;
  height: 100vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;
