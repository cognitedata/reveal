import {
  Equipment,
  useGetMapDataQuery,
  useListPeopleWithNoEquipmentQuery,
} from 'graphql/generated';
import { useQueryClient } from 'react-query';

import { EquipmentMutate, PersonMutate } from '../../types';
import { usePersonMutate } from '../person/usePersonMutate';

import { useEquipmentMutate } from './useEquipmentMutate';

export const useUpdateEquipment = () => {
  const updateEquipment = useEquipmentMutate();
  const updatePerson = usePersonMutate();
  const queryClient = useQueryClient();
  return async (
    data: Equipment,
    newEquipmentFields: Partial<EquipmentMutate>,
    oldPersonFields: Pick<PersonMutate, 'name' | 'externalId'>,
    newPersonFields: Pick<PersonMutate, 'name' | 'externalId' | 'desk'>
  ) => {
    const promiseArray = [
      updateEquipment({
        ...data,
        ...newEquipmentFields,
        person: newPersonFields.externalId,
      }),
    ];

    if (oldPersonFields.externalId !== newPersonFields.externalId) {
      // set old person's desk to null and update new person with desk
      promiseArray.push(
        updatePerson({
          ...oldPersonFields,
          desk: null,
        }),
        updatePerson({
          ...newPersonFields,
        })
      );
    }

    Promise.all(promiseArray).then(() => {
      queryClient.invalidateQueries(useGetMapDataQuery.getKey());
      queryClient.invalidateQueries(useListPeopleWithNoEquipmentQuery.getKey());
    });

    return { isloading: false };
  };
};
