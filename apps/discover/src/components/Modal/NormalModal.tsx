import * as React from 'react';

import { Button, Modal } from '@cognite/cogs.js';

import { CloseButton } from 'components/Buttons';

import {
  ConfirmFooter,
  ConfirmHeader,
  ConfirmHeaderLabel,
} from '../Modals/confirm/elements';

import { RoundedModalStyle } from './elements';

interface Props {
  title: string;
  actionText?: string;
  cancelText?: string;
  cancelLabel?: string;
  handleClose: () => void;
  handleAccept: () => void;
  width?: number;
}

/**
 * Prompts a popup modal on which the user has to accept/decline to perform given action.
 *
 * @example
 * <NormalModal title="Do you want to do this?" actionText="Do it!" handleAccept={() => performAction()} />
 */
export const NormalModal: React.FC<Props> = ({
  title,
  actionText = 'Confirm',
  cancelText = 'Cancel',
  cancelLabel = 'Close the popup',
  handleClose,
  handleAccept,
  width = 640,
}) => {
  return (
    <Modal
      style={RoundedModalStyle}
      footer={
        <ConfirmFooter>
          <Button type="ghost-danger" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button type="primary" onClick={handleAccept}>
            {actionText}
          </Button>
        </ConfirmFooter>
      }
      closeIcon={null}
      visible
      closable={false}
      onOk={handleAccept}
      width={width}
      appElement={document.getElementById('root') || undefined}
    >
      <ConfirmHeader>
        <ConfirmHeaderLabel>{title}</ConfirmHeaderLabel>
        <CloseButton onClick={handleClose} aria-label={cancelLabel} />
      </ConfirmHeader>
    </Modal>
  );
};
