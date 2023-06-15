import { useTranslation } from '@transformations/common';

import { Body, Modal } from '@cognite/cogs.js';

type RunConfirmationModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
};

const RunConfirmationModal = ({
  onCancel,
  onConfirm,
  open,
}: RunConfirmationModalProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Modal
      okText={t('yes-run-now')}
      cancelText={t('cancel')}
      onCancel={onCancel}
      onOk={onConfirm}
      title={t('warning')}
      visible={open}
      size="small"
    >
      <Body level={2}>{t('this-query-has-not-been-verified-for-run')}</Body>
    </Modal>
  );
};

export default RunConfirmationModal;
