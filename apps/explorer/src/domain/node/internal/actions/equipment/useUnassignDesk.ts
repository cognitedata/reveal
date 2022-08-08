import {
  Equipment,
  useGetMapDataQuery,
  useGetSearchDataQuery,
  useListPeopleWithNoDeskQuery,
} from 'graphql/generated';
import { useQueryClient } from 'react-query';

import { usePersonMutate } from '../person/usePersonMutate';

import { useEquipmentMutate } from './useEquipmentMutate';

export const useUnassignDesk = () => {
  const updatePerson = usePersonMutate();

  const queryClient = useQueryClient();
  const onEquipmentMutateSuccess = () => {
    queryClient.invalidateQueries(useGetMapDataQuery.getKey());
    queryClient.invalidateQueries(useListPeopleWithNoDeskQuery.getKey());
    queryClient.invalidateQueries(useGetSearchDataQuery.getKey());
  };
  const updateEquipment = useEquipmentMutate(onEquipmentMutateSuccess);

  return (oldEquipmentFields: Equipment) => {
    updateEquipment({
      ...oldEquipmentFields,
      person: null,
      room: oldEquipmentFields.room?.externalId,
    });

    updatePerson({
      externalId: oldEquipmentFields.person?.externalId,
      name: oldEquipmentFields.person?.name,
      desk: null,
    });
  };
};
