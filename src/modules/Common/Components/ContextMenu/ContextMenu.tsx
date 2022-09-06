import React from 'react';
import styled from 'styled-components';
import { ContextMenuPosition } from 'src/modules/Common/Components/ContextMenu/types';
import {
  ActionMenuProps,
  MenuContent,
} from 'src/modules/Common/Components/ActionMenu/MenuContent';

export const ContextMenu = ({
  position,
  showExifIcon,
  reviewDisabled,
  handleReview,
  handleFileDelete,
  handleFileDetails,
}: {
  position: ContextMenuPosition;
} & ActionMenuProps) => {
  return (
    <ContextMenuWrapper
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <MenuContent
        showExifIcon={showExifIcon}
        reviewDisabled={reviewDisabled}
        handleReview={handleReview}
        handleFileDelete={handleFileDelete}
        handleFileDetails={handleFileDetails}
      />
    </ContextMenuWrapper>
  );
};

const ContextMenuWrapper = styled.div`
  position: absolute;
`;
