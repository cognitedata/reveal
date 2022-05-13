import React from 'react';

import { Button, Modal } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { CloseButton } from 'components/Buttons';
import { FlexGrow } from 'styles/layout';

import { CONTINUE_EDITING, EXIT_DELETE } from './constants';
import { DialogHeader, DialogHeaderLabel, DialogFooter } from './elements';

const MODAL_STYLE = {
  borderRadius: '8px',
  top: 'calc(50% - 130px)',
};

export interface Props {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export const LeaveConfirmModal: React.FC<Props> = ({
  open,
  onOk,
  onCancel,
}) => {
  const { t } = useTranslation();

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
            {t(EXIT_DELETE)}
          </Button>
          <Button
            type="primary"
            onClick={onOk}
            data-testid="map-leave-modal-ok-btn"
          >
            {t(CONTINUE_EDITING)}
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
      <DialogHeader data-testid="drawing-mode-leave-confirmation">
        <DialogHeaderLabel>
          {t('Exit polygon mode and delete the polygon?')}
        </DialogHeaderLabel>
        <FlexGrow />
        <CloseButton
          onClick={onCancel}
          aria-label="Close and clear the results"
        />
      </DialogHeader>
    </Modal>
  );
};

export default LeaveConfirmModal;
