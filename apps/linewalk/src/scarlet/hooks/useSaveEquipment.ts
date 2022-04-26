import { Dispatch, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { saveEquipment } from 'scarlet/api';
import {
  APIState,
  AppAction,
  AppActionType,
  DataElementState,
  EquipmentData,
} from 'scarlet/types';

export const useSaveEquipment = (
  unitName: string,
  equipmentName: string,
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

    saveEquipment(client!, {
      unitName,
      equipmentName,
      equipment,
      authState: authState!,
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

export const getIsApproved = (equipment: EquipmentData) => {
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
