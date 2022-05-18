import { useState } from 'react';
import { Checkbox } from '@cognite/cogs.js';
import { useHomePageState } from 'scarlet/hooks';
import { EquipmentStatus } from 'scarlet/types';

import { Modal } from '..';

type ExportModalProps = {
  visible: boolean;
  onClose: () => void;
  onExport: (equipmentIds: string[]) => void;
};

export const ExportModal = ({
  visible,
  onClose,
  onExport,
}: ExportModalProps) => {
  const homePageState = useHomePageState();
  const { exportEquipmentsModal } = homePageState;
  const { isExportSelectedEquipments } = exportEquipmentsModal!;
  const [isIncludeNotStartedEquipments, setIsIncludeNotStartedEquipments] =
    useState(true);

  const isNotStartedCheckboxRendered =
    !isExportSelectedEquipments &&
    homePageState.equipmentListQuery.data?.some(
      (item) => item.status === EquipmentStatus.NOT_STARTED
    ) &&
    homePageState.equipmentListQuery.data?.some(
      (item) => item.status !== EquipmentStatus.NOT_STARTED
    );

  const title = isExportSelectedEquipments
    ? 'Export selected equipment?'
    : 'Export all equipment?';

  const description = isNotStartedCheckboxRendered
    ? 'Export data as spreadsheet in .xlsx format. Include the following in the spreadsheet:'
    : 'Export data as spreadsheet in .xlsx format. Exported spreadsheet will be downloaded to your local storage.';

  const exportEquipments = () => {
    const equipmentIds = isExportSelectedEquipments
      ? homePageState.selectedEquipmentIds
      : homePageState.equipmentListQuery
          .data!.filter(
            (item) =>
              isIncludeNotStartedEquipments ||
              item.status !== EquipmentStatus.NOT_STARTED
          )
          .map((item) => item.id);

    onExport(equipmentIds);
  };

  return (
    <Modal
      title={title}
      description={description}
      okText="Yes, Export"
      visible={visible}
      onOk={exportEquipments}
      onCancel={onClose}
      isPrompt
    >
      {isNotStartedCheckboxRendered && (
        <Checkbox
          name="export-not-started-equipments"
          checked={isIncludeNotStartedEquipments}
          onChange={setIsIncludeNotStartedEquipments}
        >
          Equipment with “non started” status
        </Checkbox>
      )}
    </Modal>
  );
};
