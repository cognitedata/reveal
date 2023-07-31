import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { OverwriteSearchModal } from './OverwriteSearchModal';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Modals / overwrite-search-modal',
  component: OverwriteSearchModal,
  decorators: [
    (storyFn: any) => (
      <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
    ),
  ],
};

export const Basic = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOnConfirm = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} aria-label="Open modal">
        Open modal
      </Button>
      <OverwriteSearchModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleOnConfirm}
      />
    </div>
  );
};
