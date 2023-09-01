import React from 'react';

import { Flex } from '@cognite/cogs.js';
import { CopilotChainSelectionMessage } from '@cognite/llm-hub';

import { Markdown } from './components/Markdown';
import { MessageBase } from './MessageBase';

export const ChainMessage = ({
  message,
}: {
  message: { data: CopilotChainSelectionMessage & { source: 'user' } };
}) => {
  const {
    data: { content },
  } = message;
  return (
    <MessageBase isBot hideActions message={message}>
      <Flex direction="column" gap={4} style={{ marginTop: 8 }}>
        <Markdown
          content={`You have chosen to use "${content}", please continue to search`}
        />
      </Flex>
    </MessageBase>
  );
};
