import React from 'react';

import { UserProfile } from '../../../lib/UserProfileProvider';
import { Comment } from '../../services/comments/types';

import { CommentsPane } from './CommentsPane';

export default {
  title: 'Containers/Comments Pane',
  component: CommentsPane,
};

const comments: Comment[] = [
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
      externalId: 'db06602a-2ddc-4ecb-a76f-b80610c201b8',
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

const users: UserProfile[] = [
  {
    displayName: 'Andreas Skonberg',
    email: 'andreas.skonberg@cognitedata.com',
    lastUpdatedTime: 1687867526989,
    userIdentifier: 'zKAWBUFxXTOIP__mPKyCpg',
  },
];

export const Default = () => {
  return (
    <CommentsPane
      comments={comments}
      isLoading={false}
      onCloseCommentsPane={() => console.log('comments pane closed')}
      users={users}
    />
  );
};

export const Loading = () => {
  return (
    <CommentsPane
      comments={comments}
      isLoading={true}
      onCloseCommentsPane={() => console.log('comments pane closed')}
      users={users}
    />
  );
};
