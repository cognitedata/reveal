import env from 'utils/config';
import {
  useGetMapDataQuery,
  useListPeopleWithNoDeskQuery,
} from 'graphql/generated';
import { useQueryClient } from '@tanstack/react-query';

import { EquipmentMutate } from '../../types';
import { useNodeMutate } from '../useNodeMutate';

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  const onEquipmentMutateSuccess = () => {
    queryClient.invalidateQueries(useGetMapDataQuery.getKey());
    queryClient.invalidateQueries(useListPeopleWithNoDeskQuery.getKey());
  };

  const { mutate } = useNodeMutate(onEquipmentMutateSuccess);

  return ({ externalId, name, nodeId, type }: Partial<EquipmentMutate>) =>
    mutate({
      modelName: env.dataModelStorage.modelNameEquipment,
      spaceName: env.dataModelStorage.spaceName,
      nodeContent: {
        externalId,
        name,
        nodeId,
        type,
        isBroken: false,
        person: null,
      },
    });
};
