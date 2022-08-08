import { Equipment, useListFilteredEquipmentQuery } from 'graphql/generated';
import { useQueryClient } from 'react-query';
import { EQUIPMENT_TYPES } from 'recoil/equipmentPopup/constants';

import { EquipmentMutate } from '../../types';

import { useEquipmentMutate } from './useEquipmentMutate';
import { useUpdateDesk } from './useUpdateDesk';

export const useUpdateEquipment = (type: string) => {
  const queryClient = useQueryClient();
  const updateDesk = useUpdateDesk();
  if (type === EQUIPMENT_TYPES.DESK) {
    return updateDesk;
  }

  const onEquipmentMutateSuccess = () => {
    queryClient.invalidateQueries(useListFilteredEquipmentQuery.getKey());
  };
  const updateEquipment = useEquipmentMutate(onEquipmentMutateSuccess);

  return async (newEquipmentFields: Partial<Equipment>) => {
    // use null option for person to align with schema definition
    const newEquipment = {
      ...newEquipmentFields,
      person: null,
    } as EquipmentMutate;

    if (newEquipmentFields.room?.externalId) {
      newEquipment.room = newEquipmentFields.room?.externalId;
    }
    updateEquipment(newEquipment);
  };
};
