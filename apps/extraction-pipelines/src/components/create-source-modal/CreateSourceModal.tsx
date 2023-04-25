import React from 'react';

import { Modal, ModalProps } from '@cognite/cogs.js';
import { useTranslation } from 'common';

type CreateSourceModalProps = {
  onCancel: () => void;
  visible: ModalProps['visible'];
};

export const CreateSourceModal = ({
  onCancel,
  visible,
}: CreateSourceModalProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Modal onCancel={onCancel} title={t('create-source')} visible={visible}>
      CreateSourceModal
    </Modal>
  );
};
