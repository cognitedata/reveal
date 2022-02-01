import { Dispatch, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { saveEquipment } from 'scarlet/api';
import {
  APIState,
  AppAction,
  AppActionType,
  EquipmentData,
} from 'scarlet/types';

export const useSaveEquipment = (
  unitName: string,
  equipmentName: string,
  saveApiState: APIState<EquipmentData>,
  dispatch: Dispatch<AppAction>
) => {
  const { client } = useAuthContext();
  useEffect(() => {
    const equipment = saveApiState.data;
    if (!equipment) return;

    saveEquipment(client!, {
      unitName,
      equipmentName,
      equipment,
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
