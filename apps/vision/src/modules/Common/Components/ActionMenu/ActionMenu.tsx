import React from 'react';

import styled from 'styled-components';

import { Button, Dropdown } from '@cognite/cogs.js';

import { MenuContent } from './MenuContent';

interface ActionMenuProps {
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
      <ActionMenuButton
        type="tertiary"
        icon="EllipsisHorizontal"
        aria-label="Action menu button"
        onClick={handleClick}
        disabled={actionDisabled}
      />
    </Dropdown>
  );
};

const ActionMenuButton = styled(Button)`
  background: rgba(255, 255, 255) !important;
`;
