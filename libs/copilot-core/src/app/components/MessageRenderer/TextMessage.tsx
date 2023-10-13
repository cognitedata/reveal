import React from 'react';

import { Body, Flex } from '@cognite/cogs.js';

import {
  CopilotBotTextResponse,
  CopilotMessage,
  CopilotTextResponse,
} from '../../../lib/types';

import { Markdown } from './components/Markdown';
import { MessageBase } from './MessageBase';

export const TextMessage = ({
  message,
}: {
  message: {
    data: CopilotBotTextResponse | CopilotTextResponse;
  };
}) => {
  const {
    data: { content, context },
  } = message;
  return (
    <MessageBase message={message.data as CopilotMessage}>
      <Flex direction="column" gap={4} style={{ marginTop: 8 }}>
        <Markdown content={content} />
        {context && (
          <Body level={3} style={{ flex: 1 }} muted>
            {context}
          </Body>
        )}
      </Flex>
    </MessageBase>
  );
};
