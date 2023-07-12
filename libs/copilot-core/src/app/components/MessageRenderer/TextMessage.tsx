import { Body, Flex } from '@cognite/cogs.js';

import { CopilotTextMessage } from '../../../lib/types';

export const TextMessage = ({
  message: {
    data: { content, context },
  },
}: {
  message: { data: CopilotTextMessage & { source: 'user' | 'bot' } };
}) => {
  return (
    <Flex direction="column" gap={4} style={{ marginTop: 8 }}>
      <Body level={2} style={{ flex: 1 }}>
        {content}
      </Body>
      {context && (
        <Body level={3} style={{ flex: 1 }} muted>
          {context}
        </Body>
      )}
    </Flex>
  );
};
