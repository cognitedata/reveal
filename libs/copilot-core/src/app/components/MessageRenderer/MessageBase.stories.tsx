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
    <MessageBase message={{ source: 'bot', content: 'a' }}>
      <Body level={2}>Some Message</Body>
    </MessageBase>
  );
};
export const UserMessage = () => {
  return (
    <MessageBase message={{ source: 'user', content: 'a' }}>
      <Body level={2}>Some Message</Body>
    </MessageBase>
  );
};
export const WithActions = () => {
  return (
    <MessageBase
      message={{ source: 'bot', content: 'a' }}
      actions={[{ content: 'Action 1', onClick: console.log }]}
    >
      <Body level={2}>Some Message</Body>
    </MessageBase>
  );
};
export const WithLotsOfActions = () => {
  return (
    <MessageBase
      message={{ source: 'bot', content: 'a' }}
      actions={[
        { content: 'Action 1', onClick: console.log },
        { content: 'Action 2', onClick: console.log },
        { content: 'Action 3', onClick: console.log },
        { content: 'Action 4', onClick: console.log },
        { content: 'Action 5', onClick: console.log },
        { content: 'Action 6', onClick: console.log },
        { content: 'Action 7', onClick: console.log },
        { content: 'Action 8', onClick: console.log },
        { content: 'Action 9', onClick: console.log },
        { content: 'Action 10', onClick: console.log },
      ]}
    >
      <Body level={2}>Some Message</Body>
    </MessageBase>
  );
};
