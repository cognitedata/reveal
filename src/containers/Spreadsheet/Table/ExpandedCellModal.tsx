import React from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { Modal } from 'antd';
import { Body, Colors } from '@cognite/cogs.js';

import { useCellSelection } from 'hooks/table-selection';
import { TABLE_CELL_EXPANDED_WIDTH } from 'utils/constants';

export const ExpandedCellModal = (): JSX.Element => {
  const { selectedCell, isCellExpanded, setIsCellExpanded } =
    useCellSelection();

  const onModalClose = (event: React.MouseEvent) => {
    // This stops deselect on click outside modal, so it behaves the same as the close button.
    event.stopPropagation();
    setIsCellExpanded(false);
  };

  const onCellMouseDown = (event: React.MouseEvent) => {
    // This stops dragging on text to allow selecting it.
    event.stopPropagation();
  };

  return (
    <StyledModal
      visible={isCellExpanded}
      footer={null}
      mask={false}
      centered={true}
      width={TABLE_CELL_EXPANDED_WIDTH}
      bodyStyle={{ padding: '8px 64px 8px 8px' }}
      onCancel={onModalClose}
      modalRender={(modal) => (
        <Draggable>
          <div
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
            }}
          >
            {modal}
          </div>
        </Draggable>
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
    background-color: ${Colors['greyscale-grey1'].hex()};
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
