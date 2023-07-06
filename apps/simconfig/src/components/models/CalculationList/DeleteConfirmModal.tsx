import { Modal } from '@cognite/cogs.js-v9';

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
      okText="Delete"
      title={`Delete ${decodeURIComponent(calcName)}?`}
      visible={isModelOpen}
      destructive
      onCancel={() => {
        handleModalConfirm(false);
      }}
      onOk={() => {
        handleModalConfirm(true, calculationConfig);
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
