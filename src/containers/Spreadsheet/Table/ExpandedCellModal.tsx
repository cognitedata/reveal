import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Modal } from 'antd';

import { useTableSelection } from 'hooks/table-selection';

export const ExpandedCellModal = (): JSX.Element => {
  const { selectedCell, isCellExpanded, setIsCellExpanded } =
    useTableSelection();
  const modalRef = useRef(null);

  const onModalClose = () => setIsCellExpanded(false);

  return (
    <Modal
      visible={isCellExpanded}
      footer={null}
      mask={false}
      centered={true}
      width={465}
      onCancel={onModalClose}
      modalRender={(modal) => (
        <Draggable>
          <div ref={modalRef}>{modal}</div>
        </Draggable>
      )}
    >
      {selectedCell.cellData}
    </Modal>
  );
};
