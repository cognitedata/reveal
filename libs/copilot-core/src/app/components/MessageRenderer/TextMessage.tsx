import { Body, Flex } from '@cognite/cogs.js';

import { CopilotTextMessage } from '../../../lib/types';

export const TextMessage = ({
  message: {
    data: { content },
  },
}: {
  message: { data: CopilotTextMessage };
}) => {
  return (
    <Flex direction="column" gap={4}>
      <Body level={2}>{content}</Body>
    </Flex>
  );
};
