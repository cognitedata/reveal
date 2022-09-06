import React from 'react';
import styled from 'styled-components';
import { ContextMenuPosition } from 'src/modules/Common/Components/ContextMenu/types';
import {
  ActionMenuProps,
  MenuContent,
} from 'src/modules/Common/Components/ActionMenu/MenuContent';

// need this correction because of top menu bar
const TOP_OFFSET = 50;

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
    <ContextMenuWrapper position={position}>
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

const ContextMenuWrapper = styled.div<{ position: ContextMenuPosition }>`
  position: absolute;
  left: ${(props) => props.position.x}px;
  top: ${(props) => props.position.y - TOP_OFFSET}px;
`;
