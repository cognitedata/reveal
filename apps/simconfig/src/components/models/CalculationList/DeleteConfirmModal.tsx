import { Button, Modal } from '@cognite/cogs.js';

import type { ModelCalculation } from './CalculationList';

interface DeleteConfirmModalProps {
  isModelOpen: boolean;
  handleModalConfirm(
    isConfirmed: boolean,
    calculationConfig?: ModelCalculation | null
  ): void;
  calculationConfig: ModelCalculation | null;
}

export function DeleteConfirmModal({
  isModelOpen,
  handleModalConfirm,
  calculationConfig,
}: DeleteConfirmModalProps) {
  const calcName = calculationConfig?.configuration.calculationName ?? 'NA';
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
              handleModalConfirm(true, calculationConfig);
            }}
          >
            Delete
          </Button>
        </div>
      }
      style={{ top: '20%' }}
      title={`Delete ${decodeURIComponent(calcName)}?`}
      visible={isModelOpen}
      onCancel={() => {
        handleModalConfirm(false);
      }}
    >
      <h3>
        <strong>This action cannot be undone</strong>
      </h3>
      <h3>
        The configuration and all simulation results will be deleted forever
      </h3>
    </Modal>
  );
}

export default DeleteConfirmModal;
