import * as React from 'react';

import { SearchButton, CloseButton } from 'components/Buttons';

import { FloatingActionsWrapper } from './elements';

interface ActionProps {
  handleSearchClicked: () => void;
  handleRemoveFeature: () => void;
  buttonY: number;
  buttonX: number;
}

export const SEARCH_BUTTON = 'floating-search-button';
export const DELETE_BUTTON = 'floating-delete-button';

export const FloatingActions: React.FC<ActionProps> = ({
  handleSearchClicked,
  handleRemoveFeature,
  buttonY,
  buttonX,
}) => {
  return (
    <FloatingActionsWrapper buttonY={buttonY} buttonX={buttonX}>
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
