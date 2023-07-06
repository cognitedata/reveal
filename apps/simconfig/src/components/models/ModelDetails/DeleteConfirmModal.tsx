import { Modal } from '@cognite/cogs.js';
import { Button } from '@cognite/cogs.js-v9';

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
      footer={
        <div className="cogs-modal-footer-buttons">
          <Button
            onClick={() => {
              handleModalConfirm(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="destructive"
            onClick={() => {
              handleModalConfirm(true);
            }}
          >
            Delete model
          </Button>
        </div>
      }
      style={{ top: '15%' }}
      title={`Delete model ${decodeURIComponent(modalName)}?`}
      visible={isModelOpen}
      onCancel={() => {
        handleModalConfirm(false);
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
