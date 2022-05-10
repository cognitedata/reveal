import { Dispatch, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { saveEquipment } from 'scarlet/api';
import {
  APIState,
  AppAction,
  AppActionType,
  DataElementState,
  EquipmentData,
  Facility,
} from 'scarlet/types';

export const useSaveEquipment = (
  facility: Facility,
  unitId: string,
  equipmentId: string,
  skipModifiedBy: boolean,
  saveApiState: APIState<EquipmentData>,
  dispatch: Dispatch<AppAction>
) => {
  const { authState, client } = useAuthContext();

  useEffect(() => {
    const equipment = saveApiState.data;
    if (!equipment) return;

    equipment.modified = Date.now();
    const isApproved = getIsApproved(equipment);

    if (equipment.isApproved !== isApproved || isApproved) {
      equipment.isApproved = isApproved;
    }

    const equipmentToSave = getEquipmentWithoutUnapprovedDetections(equipment);

    saveEquipment(client!, {
      facility,
      unitId,
      equipmentId,
      equipment: equipmentToSave,
      modifiedBy: !skipModifiedBy ? authState?.email : undefined,
    })
      .then(() => {
        dispatch({
          type: AppActionType.SET_SAVE_SATE,
          saveState: { loading: false },
        });
        dispatch({
          type: AppActionType.SET_EQUIPMENT,
          equipment: { loading: false, data: equipment },
        });
      })
      .catch((error) => {
        dispatch({
          type: AppActionType.SET_SAVE_SATE,
          saveState: { loading: false, error },
        });
      });
  }, [saveApiState.data]);
};

const getIsApproved = (equipment: EquipmentData) => {
  return Boolean(
    equipment.isApproved &&
      equipment.equipmentElements.every(
        (dataElement) => dataElement.state !== DataElementState.PENDING
      ) &&
      equipment.components.length &&
      equipment.components.every((component) =>
        component.componentElements.every(
          (dataElement) => dataElement.state !== DataElementState.PENDING
        )
      )
  );
};

const getEquipmentWithoutUnapprovedDetections = (
  equipment: EquipmentData
): EquipmentData => ({
  ...equipment,
  equipmentElements: equipment.equipmentElements.map((dataElement) => ({
    ...dataElement,
    detections: dataElement.detections.filter((detection) => detection.state),
  })),
  components: equipment.components.map((component) => ({
    ...component,
    componentElements: component.componentElements.map((dataElement) => ({
      ...dataElement,
      detections: dataElement.detections.filter((detection) => detection.state),
    })),
  })),
});
