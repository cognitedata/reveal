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

export const useSaveEquipment = (
  facility: Facility,
  unitId: string,
  equipmentId: string,
  isAutoSave: boolean,
  saveApiState: APIState<EquipmentData>,
  dispatch: Dispatch<AppAction>
) => {
  const { authState, client } = useAuthContext();

  useEffect(() => {
    const equipment = saveApiState.data;
    if (!equipment) return;

    equipment.modified = Date.now();

    saveEquipment(client!, {
      facility,
      unitId,
      equipmentId,
      equipment,
      modifiedBy: isAutoSave ? undefined : authState?.email,
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
