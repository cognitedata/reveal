import React from 'react';
import { Button, ButtonType, Dropdown } from '@cognite/cogs.js';
import { MenuContent } from 'src/modules/Common/Components/ActionMenu/MenuContent';

interface ActionMenuProps {
  buttonType?: string;
  showExifIcon?: boolean;
  reviewDisabled?: boolean;
  actionDisabled?: boolean;
  handleReview?: (evt: any) => void;
  handleFileDelete: () => void;
  handleFileDetails: () => void;
}
const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

export const ActionMenu = ({
  buttonType,
  showExifIcon,
  reviewDisabled,
  actionDisabled,
  handleReview,
  handleFileDelete,
  handleFileDetails,
}: ActionMenuProps) => {
  const menuContent = (
    <MenuContent
      showExifIcon={showExifIcon}
      reviewDisabled={reviewDisabled}
      handleReview={handleReview}
      handleFileDelete={handleFileDelete}
      handleFileDetails={handleFileDetails}
    />
  );
  return (
    <Dropdown content={menuContent} disabled={actionDisabled}>
      <Button
        type={(buttonType as ButtonType) || 'ghost'}
        variant={buttonType ? 'inverted' : 'default'}
        icon="EllipsisHorizontal"
        aria-label="dropdown button"
        onClick={handleClick}
        disabled={actionDisabled}
      />
    </Dropdown>
  );
};
