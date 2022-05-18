import { Dispatch, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { saveEquipment } from 'scarlet/api';
import {
  APIState,
  AppAction,
  AppActionType,
  EquipmentData,
  Facility,
} from 'scarlet/types';
import { getEquipmentToSave } from 'scarlet/utils';

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
    const equipmentToSave = getEquipmentToSave(equipment);

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
