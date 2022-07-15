import {
  Equipment,
  useGetMapDataQuery,
  useGetSearchDataQuery,
  useListPeopleWithNoEquipmentQuery,
} from 'graphql/generated';
import { useQueryClient } from 'react-query';

import { usePersonMutate } from '../person/usePersonMutate';

import { useEquipmentMutate } from './useEquipmentMutate';

export const useUnassignEquipment = () => {
  const updatePerson = usePersonMutate();

  const queryClient = useQueryClient();
  const onEquipmentMutateSuccess = () => {
    queryClient.invalidateQueries(useGetMapDataQuery.getKey());
    queryClient.invalidateQueries(useListPeopleWithNoEquipmentQuery.getKey());
    queryClient.invalidateQueries(useGetSearchDataQuery.getKey());
  };
  const updateEquipment = useEquipmentMutate(onEquipmentMutateSuccess);

  return (oldEquipmentFields: Equipment) => {
    updateEquipment({
      ...oldEquipmentFields,
      person: null,
    });

    updatePerson({
      externalId: oldEquipmentFields.person?.externalId,
      name: oldEquipmentFields.person?.name,
      desk: null,
    });
  };
};
