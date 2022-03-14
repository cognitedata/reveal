import { Body } from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

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
    onOk(typeValue);
    closeModal();
  };

  return (
    <ModalDialog
      title={t('delete_type', 'Delete Type')}
      okButtonName={t('delete_type', 'Delete Type')}
      okType="primary"
      onOk={onDeleteType}
      visible={visible}
      onCancel={closeModal}
    >
      <Body level={2}>
        {t(
          'delete_text',
          `Are you sure you want to delete the type “${typeValue}”?`
        )}
      </Body>
    </ModalDialog>
  );
};
