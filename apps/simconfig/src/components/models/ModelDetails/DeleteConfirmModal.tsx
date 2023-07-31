import { Modal } from '@cognite/cogs.js-v9';

interface DeleteConfirmModalProps {
  isModelOpen: boolean;
  handleModalConfirm(isConfirmed: boolean): void;
  modalName: string;
}

export function DeleteConfirmModal({
  isModelOpen,
  handleModalConfirm,
  modalName,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      okText="Delete model"
      title={`Delete model ${decodeURIComponent(modalName)}?`}
      visible={isModelOpen}
      destructive
      onCancel={() => {
        handleModalConfirm(false);
      }}
      onOk={() => {
        handleModalConfirm(true);
      }}
    >
      <h3>
        <strong>This action cannot be undone</strong>{' '}
      </h3>
      <h3>
        All versions of the model, any configured calculations, and all
        simulation results will be deleted forever
      </h3>
    </Modal>
  );
}

export default DeleteConfirmModal;
