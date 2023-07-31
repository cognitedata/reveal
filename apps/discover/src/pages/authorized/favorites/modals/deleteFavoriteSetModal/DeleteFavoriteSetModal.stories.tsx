import { getMockFavoriteSummary } from 'domain/favorites/service/__fixtures/favorite';

import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { FavoriteSummary } from 'modules/favorite/types';

import DeleteFavoriteSetModal from './index';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Modals / delete-favorite-set-modal',
  component: DeleteFavoriteSetModal,
  decorators: [
    (storyFn: any) => (
      <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
    ),
  ],
};

export const Basic = () => {
  const [isOpen, setIsOpen] = useState(false);

  const item: FavoriteSummary = getMockFavoriteSummary();

  const handleOnConfirm = () => {
    // Do something with the item!.
    setIsOpen(false);
  };

  return (
    <div>
      <Button aria-label="Open modal" onClick={() => setIsOpen(true)}>
        Open modal
      </Button>
      <DeleteFavoriteSetModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleOnConfirm}
        item={item}
      />
    </div>
  );
};
