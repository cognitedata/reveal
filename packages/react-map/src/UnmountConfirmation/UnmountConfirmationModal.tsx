import * as React from 'react';
import styled from 'styled-components';
import { Button, Modal } from '@cognite/cogs.js';

import { CONTINUE_EDITING, EXIT_DELETE_BUTTON_TEXT } from './constants';

const DialogFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  .cogs-btn {
    margin-left: 10px;
    border-radius: 6px;
  }
  .cogs-btn-ghost {
    color: var(--cogs-red-2);
  }
`;

const MODAL_STYLE = {
  borderRadius: '8px',
  top: 'calc(50% - 130px)',
};

export interface UnmountConfirmationModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
}
export const UnmountConfirmationModal: React.FC<
  React.PropsWithChildren<UnmountConfirmationModalProps>
> = ({ open, onOk, onCancel, children }) => {
  return (
    <Modal
      style={MODAL_STYLE}
      footer={
        <DialogFooter>
          <Button
            type="ghost-danger"
            onClick={onCancel}
            data-testid="map-leave-modal-cancel-btn"
          >
            {EXIT_DELETE_BUTTON_TEXT}
          </Button>
          <Button
            type="primary"
            onClick={onOk}
            data-testid="map-leave-modal-ok-btn"
          >
            {CONTINUE_EDITING}
          </Button>
        </DialogFooter>
      }
      closeIcon={null}
      visible={open}
      closable={false}
      onOk={onOk}
      width={640}
      appElement={document.getElementById('root') || undefined}
    >
      {children}
    </Modal>
  );
};
