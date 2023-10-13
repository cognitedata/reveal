import type { Meta } from '@storybook/react';

import { Body } from '@cognite/cogs.js';

import { MessageBase } from './MessageBase';

const Story: Meta<typeof MessageBase> = {
  component: MessageBase,
  title: 'Messages/MessageBase',
};
export default Story;

export const Default = () => {
  return (
    <MessageBase
      message={{ data: { type: 'text', source: 'bot', content: 'a' } }}
    >
      <Body level={2}>Some Message</Body>
    </MessageBase>
  );
};
export const UserMessage = () => {
  return (
    <MessageBase
      message={{ data: { type: 'text', source: 'bot', content: 'a' } }}
    >
      <Body level={2}>Some Message</Body>
    </MessageBase>
  );
};
