import React from 'react';

import styled from 'styled-components';

import { useCellSelection } from '@transformations/hooks/table-selection';
import { TABLE_CELL_EXPANDED_WIDTH } from '@transformations/utils/constants';
import { NO_CELL_SELECTED } from '@transformations/utils/table';
import { Modal } from 'antd';

import { Body, Colors } from '@cognite/cogs.js';

export const ExpandedCellModal = (): JSX.Element => {
  const { selectedCell, isCellExpanded, setIsCellExpanded, setSelectedCell } =
    useCellSelection();

  const onModalClose = (event: React.MouseEvent) => {
    // This stops deselect on click outside modal, so it behaves the same as the close button.
    event.stopPropagation();
    setIsCellExpanded(false);
    setSelectedCell(NO_CELL_SELECTED);
  };

  const onCellMouseDown = (event: React.MouseEvent) => {
    // This stops dragging on text to allow selecting it.
    event.stopPropagation();
  };

  return (
    <StyledModal
      open={isCellExpanded}
      footer={null}
      mask={false}
      centered={true}
      width={TABLE_CELL_EXPANDED_WIDTH}
      bodyStyle={{ padding: '8px 64px 8px 8px' }}
      onCancel={onModalClose}
      modalRender={(modal) => (
        <div
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
          }}
        >
          {modal}
        </div>
      )}
    >
      <CellContent onMouseDown={onCellMouseDown}>
        <Body level={3}>{selectedCell.cellData}</Body>
      </CellContent>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  padding: 0;

  .ant-modal-content {
    background-color: ${Colors['decorative--grayscale--100']};
    padding: 0;
    .ant-modal-close > .ant-modal-close-x {
      width: 36px;
      height: 36px;
      line-height: 36px;
    }
  }
`;
const CellContent = styled.div`
  background-color: white;
  box-sizing: border-box;
  padding: 8px;
  height: auto;
  max-height: 330px;
  overflow: auto;
`;
