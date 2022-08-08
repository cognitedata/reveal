import {
  Equipment,
  useGetMapDataQuery,
  useGetSearchDataQuery,
  useListPeopleWithNoDeskQuery,
} from 'graphql/generated';
import { useQueryClient } from 'react-query';

import { usePersonMutate } from '../person/usePersonMutate';

import { useEquipmentMutate } from './useEquipmentMutate';

export const useUpdateDesk = () => {
  const updatePerson = usePersonMutate();
  const queryClient = useQueryClient();

  const onEquipmentMutateSuccess = () => {
    queryClient.invalidateQueries(useGetMapDataQuery.getKey());
    queryClient.invalidateQueries(useListPeopleWithNoDeskQuery.getKey());
    queryClient.invalidateQueries(useGetSearchDataQuery.getKey());
  };
  const updateEquipment = useEquipmentMutate(onEquipmentMutateSuccess);

  return async (
    oldEquipmentFields: Equipment,
    newEquipmentFields: Partial<Equipment>
  ) => {
    const newPersonExternalId = newEquipmentFields.person?.externalId;
    const oldPersonExternalId = oldEquipmentFields.person?.externalId;

    // use null option for person to align with schema definition
    updateEquipment({
      ...oldEquipmentFields,
      ...newEquipmentFields,
      person: newPersonExternalId || null,
      room:
        newEquipmentFields.room?.externalId ||
        oldEquipmentFields.room?.externalId,
    });

    if (oldPersonExternalId !== newPersonExternalId) {
      // set old person's desk to null and update new person with desk
      const oldPerson = {
        ...oldEquipmentFields.person,
        team: oldEquipmentFields.person?.team?.externalId,
      };
      const newPerson = {
        ...newEquipmentFields.person,
        team: newEquipmentFields.person?.team?.externalId,
        desk: newEquipmentFields.externalId,
      };

      // prevent making empty people
      if (oldPersonExternalId) {
        updatePerson({
          ...oldPerson,
          desk: null,
        });
      }

      if (newPersonExternalId) {
        updatePerson(newPerson);
      }
    }
  };
};
