import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Modal } from 'antd';

import { useTableSelection } from 'hooks/table-selection';

export const ExpandedCellModal = (): JSX.Element => {
  const { isCellExpanded, setIsCellExpanded } = useTableSelection();
  const modalRef = useRef(null);

  const onModalClose = () => setIsCellExpanded(false);

  return (
    <Modal
      visible={isCellExpanded}
      footer={null}
      mask={false}
      onCancel={onModalClose}
      modalRender={(modal) => (
        <Draggable>
          <div ref={modalRef}>{modal}</div>
        </Draggable>
      )}
    >
      :3
    </Modal>
  );
};
