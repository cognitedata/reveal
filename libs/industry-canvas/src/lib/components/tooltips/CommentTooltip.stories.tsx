import { BrowserRouter } from 'react-router-dom';

import { ComponentStory } from '@storybook/react';

import { Flex } from '@cognite/cogs.js';

import { CommentTooltipCore } from './CommentTooltip';

export default {
  title: 'Tooltips/Comment Tooltip',
  component: CommentTooltipCore,
};

export const CommentTooltipStory: ComponentStory<
  typeof CommentTooltipCore
> = () => {
  return (
    <BrowserRouter>
      <Flex style={{ marginTop: 200, marginLeft: 200, position: 'relative' }}>
        <CommentTooltipCore
          userIdentifier="some name"
          users={[
            {
              displayName: 'some name',
              userIdentifier: 'some name',
              lastUpdatedTime: 1,
            },
            {
              displayName: 'some other name',
              userIdentifier: 'some other name',
              lastUpdatedTime: 1,
            },
            {
              displayName: 'some other name 1',
              userIdentifier: 'some other name 2',
              lastUpdatedTime: 1,
            },
            {
              displayName: 'some other name 2',
              userIdentifier: 'some other name 3',
              lastUpdatedTime: 1,
            },
            {
              displayName: 'some other name 3',
              userIdentifier: 'some other name 4',
              lastUpdatedTime: 1,
            },
            {
              displayName: 'some other name 4',
              userIdentifier: 'some other name 5',
              lastUpdatedTime: 1,
            },
            {
              displayName: 'some other name 5',
              userIdentifier: 'some other name 6',
              lastUpdatedTime: 1,
            },
          ]}
          comment={{
            text: 'Hello World',
            author: 'some name',
            canvas: { externalId: '' },
            x: 1,
            y: 1,
            externalId: 'asfad',
            createdTime: new Date(),
            lastUpdatedTime: new Date(),
            subComments: [
              {
                text: 'Hello World @some.name @some.other.name @some.wrong.name @ asfads',
                author: 'some name',
                canvas: { externalId: '' },
                x: 1,
                y: 1,
                externalId: 'asfad',
                createdTime: new Date(),
                lastUpdatedTime: new Date(),
                subComments: [],
              },
            ],
          }}
          onDelete={() => {
            console.log('onDelete');
          }}
          onCreate={(prop) => {
            console.log('onCreate, prop:', prop);
          }}
        />
      </Flex>
    </BrowserRouter>
  );
};
