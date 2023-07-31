import * as React from 'react';

import { WarningModal } from 'components/Modal';

import {
  WARNING_MODAL_EXPLANATION,
  WARNING_MODAL_QUESTION,
  WARNING_MODAL_TITLE,
} from './constants';
import { ThreeDeeWarningContentQuestion } from './elements';

export interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  show3dWarningModal: boolean;
}

export const WarningModal3D: React.FC<Props> = ({
  onConfirm,
  onCancel,
  show3dWarningModal,
}) => {
  return (
    <WarningModal
      visible={show3dWarningModal}
      onOk={onConfirm}
      onCancel={onCancel}
      title={WARNING_MODAL_TITLE}
    >
      <span>
        <span>{WARNING_MODAL_EXPLANATION}</span>
        <ThreeDeeWarningContentQuestion>
          {WARNING_MODAL_QUESTION}
        </ThreeDeeWarningContentQuestion>
      </span>
    </WarningModal>
  );
};
