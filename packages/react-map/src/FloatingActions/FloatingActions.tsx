import * as React from 'react';

import { CloseButton } from './CloseButton';
import { SearchButton } from './SearchButton';
import { FloatingActionsWrapper } from './elements';

export const FLOATING_SEARCH_BUTTON_TEST_ID = 'floating-search-button';
export const FLOATING_DELETE_BUTTON_TEST_ID = 'floating-delete-button';

export const FloatingActions: React.FC<{
  onSearchClicked: () => void;
  onDeleteClicked: () => void;
  zIndex?: number;
}> = ({ onSearchClicked, onDeleteClicked, zIndex }) => {
  return (
    <FloatingActionsWrapper zIndex={zIndex === undefined ? 5 : zIndex}>
      <SearchButton
        data-testid={FLOATING_SEARCH_BUTTON_TEST_ID}
        onClick={onSearchClicked}
      />
      <CloseButton
        aria-label="Delete"
        tooltip="Delete"
        data-testid={FLOATING_DELETE_BUTTON_TEST_ID}
        onClick={onDeleteClicked}
      />
    </FloatingActionsWrapper>
  );
};

export const FloatingActionsMemo = React.memo(FloatingActions);
