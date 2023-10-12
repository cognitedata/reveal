import { Body, Modal } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';

type BaseModalProps = {
  visible: boolean;
  closeModal: () => void;
  onOk: (typeName: string) => void;
  typeValue: string;
};

export const TypeDeleteModal = ({
  closeModal,
  onOk,
  visible,
  typeValue,
}: BaseModalProps) => {
  const { t } = useTranslation('type_modal');

  const onDeleteType = () => {
    closeModal();
    onOk(typeValue);
  };

  return (
    <Modal
      title={t('delete_type', 'Delete Type')}
      okText={t('delete_type', 'Delete Type')}
      onOk={onDeleteType}
      visible={visible}
      onCancel={closeModal}
      destructive
    >
      <Body level={2}>
        {t(
          'delete_text',
          `Are you sure you want to delete the type “${typeValue}”?`
        )}
      </Body>
    </Modal>
  );
};
