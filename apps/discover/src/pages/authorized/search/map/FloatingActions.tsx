import * as React from 'react';

import { SearchButton, CloseButton } from 'components/Buttons';

import { FloatingActionsWrapper } from './elements';

interface ActionProps {
  handleSearchClicked: () => void;
  handleRemoveFeature: () => void;
}

export const SEARCH_BUTTON = 'floating-search-button';
export const DELETE_BUTTON = 'floating-delete-button';

export const FloatingActions: React.FC<ActionProps> = ({
  handleSearchClicked,
  handleRemoveFeature,
}) => {
  return (
    <FloatingActionsWrapper>
      <SearchButton data-testid={SEARCH_BUTTON} onClick={handleSearchClicked} />
      <CloseButton
        data-testid={DELETE_BUTTON}
        aria-label="Delete"
        onClick={handleRemoveFeature}
      />
    </FloatingActionsWrapper>
  );
};

export default React.memo(FloatingActions);
