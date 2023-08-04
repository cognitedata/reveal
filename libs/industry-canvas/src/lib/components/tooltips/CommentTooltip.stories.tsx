import { BrowserRouter } from 'react-router-dom';

import { ComponentStory } from '@storybook/react';

import { Flex } from '@cognite/cogs.js';

import { Comment } from '../../services/comments/types';

import { CommentTooltipCore } from './CommentTooltip';

const commentList: Comment[] = [
  {
    text: 'ugh',
    taggedUsers: [
      {
        userIdentifier: 'K03kXwz-HZeya34kcEgUVw',
        email: 'marvin.reza@cognitedata.com',
        displayName: 'Marvin Reza',
        lastUpdatedTime: 1682406153148,
      },
      {
        userIdentifier: 'Idhf470_U6pjurtPlUufeg',
        email: 'mihil.ranathunga@cognitedata.com',
        displayName: 'Mihil Chathuranga  Samarawickrama Ranathunga',
        lastUpdatedTime: 1682414218619,
      },
    ],
    externalId: '359d1a53-afc2-4b42-a8d0-27a70cfc8f65',
    lastUpdatedTime: new Date('2023-07-10T21:22:59.214Z'),
    createdTime: new Date('2023-07-10T21:22:59.214Z'),
    createdBy: {
      userIdentifier: 'K03kXwz-HZeya34kcEgUVw',
      email: 'marvin.reza@cognitedata.com',
      displayName: 'Marvin Reza',
      lastUpdatedTime: 1682406153148,
    },
  },
  {
    text: 'This is my cool message',
    parentComment: {
      externalId: '359d1a53-afc2-4b42-a8d0-27a70cfc8f65',
    },
    externalId: 'b5a3afa4-981c-49d9-ae54-02c294ee6483',
    lastUpdatedTime: new Date('2023-07-12T10:55:56.602Z'),
    createdTime: new Date('2023-07-12T10:55:56.602Z'),
    createdBy: {
      userIdentifier: '7Jk1xtg0qqr0-LJkatoGOQ',
      email: 'mustafa.sarac@cognitedata.com',
      displayName: 'Mustafa Sarac',
      lastUpdatedTime: 1682420852021,
    },
  },
];
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
          commentExternalId="359d1a53-afc2-4b42-a8d0-27a70cfc8f65"
          comments={commentList}
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
