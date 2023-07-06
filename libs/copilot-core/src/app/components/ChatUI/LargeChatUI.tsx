import { BotUIMessageList, BotUIAction } from '@botui/react';
import styled from 'styled-components/macro';

import { Flex } from '@cognite/cogs.js';

import { useCopilotContext } from '../../utils/CopilotContext';
import zIndex from '../../utils/zIndex';
import { actionRenderers } from '../ActionRenderer';
import { messageRenderers } from '../MessageRenderer';

import { ChatHeader } from './ChatHeader';
import { HistoryList } from './HistoryList';

export const LargeChatUI = () => {
  const { mode } = useCopilotContext();
  return (
    <LargeChatWrapper>
      <ChatHeader style={{ paddingTop: 16, paddingBottom: 16 }} />
      {mode === 'chat' ? (
        <>
          <Flex
            direction="column"
            style={{ overflow: 'auto', marginBottom: 8, marginTop: 8, flex: 1 }}
          >
            <BotUIMessageList renderer={messageRenderers} />
          </Flex>
          <BotUIAction renderer={actionRenderers} />
        </>
      ) : (
        <HistoryList />
      )}
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
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;
