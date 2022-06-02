import { Modal } from '@cognite/cogs.js';

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
      title="Are you sure?"
      visible={isModelOpen}
      onCancel={() => {
        handleModalConfirm(false);
      }}
      onOk={() => {
        handleModalConfirm(true, calculationConfig);
      }}
    >
      <h3>{`Do you want to delete ${calcName} calculation config?
      This is an irreversible action`}</h3>
    </Modal>
  );
}

export default DeleteConfirmModal;
