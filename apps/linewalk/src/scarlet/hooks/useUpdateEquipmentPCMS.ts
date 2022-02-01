import { useCallback } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { updateEquipmentPCMS } from 'scarlet/api';

import { useAppState } from '.';

export const useUpdateEquipmentPCMS = (key: string) => {
  const { client } = useAuthContext();
  const appState = useAppState();
  const equipmentAssetExternalId = appState.pcms.data?.equipmentAssetExternalId;

  const mutate = useCallback(
    (value: string) =>
      client &&
      equipmentAssetExternalId &&
      updateEquipmentPCMS(client, { equipmentAssetExternalId, key, value }),
    [client, appState.pcms.data?.equipmentAssetExternalId]
  );

  return mutate;
};
