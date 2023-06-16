import { useTranslation } from '@transformations/common';

import { Modal } from '@cognite/cogs.js';

type CredentialsMissingModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
};

const CredentialsMissingModal = ({
  onCancel,
  onConfirm,
  open,
}: CredentialsMissingModalProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Modal
      okText={t('set-credentials')}
      onOk={onConfirm}
      onCancel={onCancel}
      title={t('credentials-missing')}
      visible={open}
    >
      {t('credentials-missing-description')}
    </Modal>
  );
};

export default CredentialsMissingModal;
