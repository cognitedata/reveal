import {
  Equipment,
  useGetMapDataQuery,
  useGetSearchDataQuery,
  useListPeopleWithNoEquipmentQuery,
} from 'graphql/generated';
import { useQueryClient } from 'react-query';

import { usePersonMutate } from '../person/usePersonMutate';

import { useEquipmentMutate } from './useEquipmentMutate';

export const useUpdateEquipment = () => {
  const updatePerson = usePersonMutate();
  const queryClient = useQueryClient();

  const onEquipmentMutateSuccess = () => {
    queryClient.invalidateQueries(useGetMapDataQuery.getKey());
    queryClient.invalidateQueries(useListPeopleWithNoEquipmentQuery.getKey());
    queryClient.invalidateQueries(useGetSearchDataQuery.getKey());
  };
  const updateEquipment = useEquipmentMutate(onEquipmentMutateSuccess);

  return async (
    oldEquipmentFields: Equipment,
    newEquipmentFields: Partial<Equipment>
  ) => {
    const newPersonExternalId = newEquipmentFields.person?.externalId;
    const oldPersonExternalId = oldEquipmentFields.person?.externalId;
    const promiseArray = [
      updateEquipment({
        ...oldEquipmentFields,
        ...newEquipmentFields,
        person: newPersonExternalId,
      }),
    ];

    if (oldPersonExternalId !== newPersonExternalId) {
      // set old person's desk to null and update new person with desk
      const oldPerson = {
        ...oldEquipmentFields.person,
        team: oldEquipmentFields.person?.team?.externalId,
      };
      const newPerson = {
        ...newEquipmentFields.person,
        team: newEquipmentFields.person?.team?.externalId,
        desk: oldEquipmentFields.externalId,
      };

      if (oldPersonExternalId) {
        promiseArray.push(
          updatePerson({
            ...oldPerson,
            desk: null,
          })
        );
      }
      promiseArray.push(updatePerson(newPerson));
    }

    Promise.all(promiseArray);

    return { isloading: false };
  };
};
