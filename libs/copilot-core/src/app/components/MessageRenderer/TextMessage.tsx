import React from 'react';

import { Body, Flex } from '@cognite/cogs.js';

import { CopilotTextMessage } from '../../../lib/types';

import { Markdown } from './components/Markdown';
import { MessageBase } from './MessageBase';

export const TextMessage = ({
  message,
}: {
  message: { data: CopilotTextMessage & { source: 'user' | 'bot' } };
}) => {
  const {
    data: { content, context },
  } = message;
  return (
    <MessageBase message={message}>
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
