import React, { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { Modal } from 'antd';
import { Body, Colors } from '@cognite/cogs.js';

import { useTableSelection } from 'hooks/table-selection';

export const ExpandedCellModal = (): JSX.Element => {
  const [canDrag, setCanDrag] = useState<boolean>(true);
  const { selectedCell, isCellExpanded, setIsCellExpanded } =
    useTableSelection();
  const modalRef = useRef(null);

  const onModalClose = () => setIsCellExpanded(false);
  const onCellMouseDown = () => setCanDrag(false);
  const onCellMouseUp = () => setCanDrag(true);

  return (
    <StyledModal
      visible={isCellExpanded}
      footer={null}
      mask={false}
      centered={true}
      width={465}
      bodyStyle={{ padding: '8px 64px 8px 8px' }}
      onCancel={onModalClose}
      modalRender={(modal) => (
        <Draggable disabled={!canDrag}>
          <div ref={modalRef}>{modal}</div>
        </Draggable>
      )}
    >
      <CellContent onMouseDown={onCellMouseDown} onMouseUp={onCellMouseUp}>
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
