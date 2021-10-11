// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - PLEASE FIX NEXT TIME YOU CHANGE THIS FILE

import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import ShareFavoriteModal from './ShareFavoriteSetModal';

export default {
  title: 'Components / Modals / share-favourite-set-modal',
  component: ShareFavoriteModal,
  decorators: [
    (storyFn) => (
      <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
    ),
  ],
};

export const Basic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const availableUsers = [
    {
      id: 2,
      displayName: 'Lando Calrissian',
      mail: 'lando.calrissian@rebelli.on',
    },
    { id: 3, displayName: 'Han Solo', mail: 'han.solo@rebelli.on' },
  ];

  const item = {
    sensitiveDocumentsCount: 0,
    members: [
      {
        id: 1,
        displayName: 'Luke skywalker',
        mail: 'luke.skywalker@rebelli.on',
        isOwner: true,
      },
      {
        id: 2,
        displayName: 'Lando Calrissian',
        mail: 'lando.calrissian@rebelli.on',
        isOwner: false,
      },
    ],
  };

  const clearUserSearchResults = () => setUsers([]);

  const searchForUserByName = (value) => {
    const u = availableUsers.filter((a) => a.displayName.includes(value));
    setUsers([...u]);
  };

  // const removeMember = (item, member) => {};

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} aria-label="Open modal">
        Open modal
      </Button>
      <ShareFavoriteModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        item={item}
        users={users}
        clearUserSearchResults={clearUserSearchResults}
        searchForUserByName={searchForUserByName}
      />
    </div>
  );
};

export const WithSensitiveDocuments = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const availableUsers = [
    {
      id: 2,
      displayName: 'Lando Calrissian',
      mail: 'lando.calrissian@rebelli.on',
    },
    { id: 3, displayName: 'Han Solo', mail: 'han.solo@rebelli.on' },
  ];

  const item = {
    sensitiveDocumentsCount: 2,
    members: [
      {
        id: 1,
        displayName: 'Luke skywalker',
        mail: 'luke.skywalker@rebelli.on',
        isOwner: true,
      },
      {
        id: 2,
        displayName: 'Lando Calrissian',
        mail: 'lando.calrissian@rebelli.on',
        isOwner: false,
      },
    ],
  };

  const clearUserSearchResults = () => setUsers([]);

  const searchForUserByName = (value) => {
    const u = availableUsers.filter((a) => a.displayName.includes(value));
    setUsers([...u]);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} aria-label="Open modal">
        Open modal
      </Button>
      <ShareFavoriteModal
        isOpen={isOpen}
        onCancel={(event, reason) => {
          console.warn('onCancel', { event, reason });
          setIsOpen(false);
        }}
        item={item}
        users={users}
        clearUserSearchResults={clearUserSearchResults}
        searchForUserByName={searchForUserByName}
      />
    </div>
  );
};
