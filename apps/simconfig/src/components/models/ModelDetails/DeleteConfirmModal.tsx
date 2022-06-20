import { Button, Modal } from '@cognite/cogs.js';

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
            type="danger"
            onClick={() => {
              handleModalConfirm(true);
            }}
          >
            Delete model
          </Button>
        </div>
      }
      style={{ top: '15%' }}
      title="Are you sure?"
      visible={isModelOpen}
      onCancel={() => {
        handleModalConfirm(false);
      }}
    >
      <h3>
        Do you want to delete model{' '}
        <strong>{decodeURIComponent(modalName)}</strong>{' '}
      </h3>
      <br />
      <h3>
        This is an irreversible action, it will delete all versions of the
        model, any configured calculations and all simulation results
      </h3>
    </Modal>
  );
}

export default DeleteConfirmModal;
