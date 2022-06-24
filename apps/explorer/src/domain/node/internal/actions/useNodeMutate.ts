import { updateNode } from 'domain/node/service/network/updateNode';

import { Building, Room, Equipment, Person } from 'graphql/generated';
import { useMutation } from 'react-query';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

type Updateable = Building | Equipment | Room | Person;

export const useNodeMutate = () => {
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
      // onSuccess: (data) => {
      //   console.log('data', data);
      // },
    }
  );
};
