import {
  Room,
  useGetMapDataQuery,
  useGetSearchDataQuery,
} from 'graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
import env from 'utils/config';

import { useNodeMutate } from '../useNodeMutate';

export const useRoomMutate = () => {
  const queryClient = useQueryClient();
  const onRoomMutateSuccess = () => {
    queryClient.invalidateQueries(useGetMapDataQuery.getKey());
    queryClient.invalidateQueries(useGetSearchDataQuery.getKey());
  };
  const { mutate } = useNodeMutate(onRoomMutateSuccess);

  return ({
    externalId,
    name,
    description,
    isBookable,
    nodeId,
    type,
  }: Partial<Room>) =>
    mutate({
      modelName: env.dataModelStorage.modelNameRoom,
      spaceName: env.dataModelStorage.spaceName,
      nodeContent: {
        externalId,
        name,
        description,
        isBookable,
        nodeId,
        type,
      },
    });
};
