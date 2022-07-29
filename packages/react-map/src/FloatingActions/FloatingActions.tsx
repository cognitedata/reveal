import * as React from 'react';

import { CloseButton } from './CloseButton';
import { SearchButton } from './SearchButton';
import { FloatingActionsWrapper } from './elements';

export const FLOATING_SEARCH_BUTTON_TEST_ID = 'floating-search-button';
export const FLOATING_DELETE_BUTTON_TEST_ID = 'floating-delete-button';

interface ActionProps {
  handleSearchClicked: () => void;
  handleRemoveFeature: () => void;
  zIndex?: number;
}
export const FloatingActions: React.FC<ActionProps> = ({
  handleSearchClicked,
  handleRemoveFeature,
  zIndex,
}) => {
  return (
    <FloatingActionsWrapper zIndex={zIndex === undefined ? 5 : zIndex}>
      <SearchButton
        data-testid={FLOATING_SEARCH_BUTTON_TEST_ID}
        onClick={handleSearchClicked}
      />
      <CloseButton
        aria-label="Delete"
        data-testid={FLOATING_DELETE_BUTTON_TEST_ID}
        onClick={handleRemoveFeature}
      />
    </FloatingActionsWrapper>
  );
};

export default React.memo(FloatingActions);
