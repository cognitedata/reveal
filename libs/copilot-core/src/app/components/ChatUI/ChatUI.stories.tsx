import { useEffect, useState } from 'react';

import { useBotUI } from '@botui/react';
import type { Meta } from '@storybook/react';

import { CogniteClient } from '@cognite/sdk';

import { CopilotMessage } from '../../../lib/types';
import { CopilotContextProvider } from '../../context/CopilotContext';

import { ChatUIInner } from './ChatUI';

const Story: Meta<typeof ChatUIInner> = {
  component: ChatUIInner,
  title: 'Chat/ChatUI',
  decorators: [
    (InnerStory) => {
      return (
        <>
          <CopilotContextProvider sdk={{} as CogniteClient}>
            <InnerStory />
          </CopilotContextProvider>
        </>
      );
    },
  ],
};
export default Story;

export const Default = () => {
  const bot = useBotUI();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    bot.message.removeAll().then(() => {
      bot.message
        .setAll([
          {
            type: 'text',
            data: {
              source: 'bot',
              content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris.',
              type: 'text',
              key: 0,
            } as CopilotMessage,
            meta: {
              messageType: 'text',
            },
            key: 0,
          },
          {
            type: 'code',
            data: {
              source: 'bot',
              language: 'python',
              content: 'def foo():\n    print("bar")\n',
              type: 'code',
              key: 1,
            } as CopilotMessage,
            meta: {
              messageType: 'code',
            },
            key: 1,
          },
          {
            type: 'text',
            data: {
              source: 'user',
              content: 'I typed something just now',
              type: 'text',
              key: 0,
            } as CopilotMessage,
            meta: {
              previous: {
                key: 1,
                data: {},
                meta: {},
                type: 'action',
              },
              messageType: 'text',
            },
            key: 2,
          },
        ])
        .then(() => {
          // eslint-disable-next-line testing-library/await-async-utils
          bot.wait();
          setTimeout(() => setVisible(true), 100);
        });
    });
  }, [bot]);
  if (visible) {
    return <ChatUIInner />;
  }
  return <></>;
};
