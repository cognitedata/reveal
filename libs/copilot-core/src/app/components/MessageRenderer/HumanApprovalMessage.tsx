import { Body, Button, Flex } from '@cognite/cogs.js';

import {
  CopilotBotMessage,
  CopilotHumanApprovalMessage,
} from '../../../lib/types';

import { MessageBase } from './MessageBase';

export const HumanApprovalMessage = ({
  message: {
    key,
    data: message,
    meta: { updateMessage },
  },
}: {
  message: {
    key: number;
    data: CopilotHumanApprovalMessage;
    meta: { updateMessage: (key: number, message: CopilotBotMessage) => void };
  };
}) => {
  return (
    <MessageBase message={{ data: { ...message, source: 'bot' } }}>
      <Flex direction="column" gap={4}>
        <Body level={2}>{message.content}</Body>
        <Flex gap={2}>
          <Button
            type="ghost"
            icon="Checkmark"
            disabled={!message.pending}
            onClick={() => {
              updateMessage(key, {
                ...message,
                approved: true,
                pending: false,
              });
            }}
          />
          <Button
            type="ghost"
            icon="Close"
            disabled={!message.pending}
            onClick={() => {
              updateMessage(key, {
                ...message,
                approved: false,
                pending: false,
              });
            }}
          />
        </Flex>
      </Flex>
    </MessageBase>
  );
};
