import env from 'utils/config';
import { useGetMapDataQuery, useGetSearchDataQuery } from 'graphql/generated';
import { useQueryClient } from 'react-query';

import { RoomMutate } from '../../types';
import { useNodeMutate } from '../useNodeMutate';

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const onRoomMutateSuccess = () => {
    queryClient.invalidateQueries(useGetMapDataQuery.getKey());
    queryClient.invalidateQueries(useGetSearchDataQuery.getKey());
  };

  const { mutate } = useNodeMutate(onRoomMutateSuccess);

  return ({ externalId, name, nodeId, type }: Partial<RoomMutate>) =>
    mutate({
      modelName: env.dataModelStorage.modelNameRoom,
      spaceName: env.dataModelStorage.spaceName,
      nodeContent: {
        externalId,
        description: '',
        name,
        nodeId,
        type,
        isBookable: false,
      },
    });
};
