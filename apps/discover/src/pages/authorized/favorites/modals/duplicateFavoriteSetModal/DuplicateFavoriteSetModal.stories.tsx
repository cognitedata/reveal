import { useState } from 'react';

import { getMockFavoriteSummary } from 'services/favorites/__fixtures/favorite';

import { Button } from '@cognite/cogs.js';

import { FavoriteSummary } from 'modules/favorite/types';

import DuplicateFavoriteSetModal from './index';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Modals / duplicate-favourite-set-modal',
  component: DuplicateFavoriteSetModal,
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
      <DuplicateFavoriteSetModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleOnConfirm}
        item={item}
      />
    </div>
  );
};
