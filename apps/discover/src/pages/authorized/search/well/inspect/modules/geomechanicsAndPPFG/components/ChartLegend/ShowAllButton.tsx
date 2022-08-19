import React, { useState } from 'react';

import { BaseButton } from 'components/Buttons';

import { ShowAllButtonWrapper } from './elements';

export interface ShowAllButtonProps {
  onClick: (showAll: boolean) => void;
}

export const ShowAllButton: React.FC<ShowAllButtonProps> = ({ onClick }) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  const toggleShowAll = () => {
    const nextState = !showAll;
    setShowAll(nextState);
    onClick(nextState);
  };

  return (
    <ShowAllButtonWrapper>
      <BaseButton
        type="ghost"
        size="small"
        icon={showAll ? 'ChevronUp' : 'ChevronDown'}
        text={showAll ? 'Show less' : 'Show more'}
        aria-label={showAll ? 'Show less' : 'Show more'}
        onClick={toggleShowAll}
      />
    </ShowAllButtonWrapper>
  );
};
