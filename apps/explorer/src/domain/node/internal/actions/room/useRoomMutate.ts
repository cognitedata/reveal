import { Room } from 'graphql/generated';
import env from 'utils/config';

import { useNodeMutate } from '../useNodeMutate';

export const useRoomMutate = () => {
  const { mutate } = useNodeMutate();

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
