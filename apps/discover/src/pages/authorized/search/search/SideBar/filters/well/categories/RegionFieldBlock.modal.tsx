import * as React from 'react';

import { NormalModal } from 'components/modal/NormalModal';

interface Props {
  handleClose: () => void;
  handleAccept: () => void;
}
export const ChangeWarningModal: React.FC<Props> = ({
  handleClose,
  handleAccept,
}) => {
  const actionText = 'Reset and continue';
  const cancelText = 'Cancel';
  const title = 'Do you want to reset your selection?';

  return (
    <NormalModal
      title={title}
      actionText={actionText}
      cancelText={cancelText}
      handleClose={handleClose}
      handleAccept={handleAccept}
    />
  );
};
