import { updateNode } from 'domain/node/service/network/updateNode';

import { Building } from 'graphql/generated';
import { useMutation } from 'react-query';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { EquipmentMutate, PersonMutate, RoomMutate } from '../types';

type Updateable = Building | EquipmentMutate | RoomMutate | PersonMutate;

export const useNodeMutate = (onSuccess?: () => void) => {
  const client = getCogniteSDKClient();

  return useMutation(
    ({
      modelName,
      spaceName,
      nodeContent,
    }: {
      modelName: string;
      spaceName: string;
      nodeContent: Partial<Updateable>;
    }) => {
      return updateNode({ client, modelName, spaceName, items: [nodeContent] });
    },
    {
      onSuccess,
    }
  );
};
