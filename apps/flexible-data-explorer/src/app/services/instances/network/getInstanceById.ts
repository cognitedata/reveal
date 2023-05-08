import { query } from 'gql-query-builder';
import { FDMClient } from '../../FDMClient';

export const getInstanceById = (
  fdmClient: FDMClient,
  headers: {
    space: string;
    dataModel: string;
    version: string;
    dataType: string;
    externalId: string;
  }
) => {
  const result = query({
    operation: 'getActorById',
    fields: [
      {
        items: ['name', 'space'],
      },
    ],
    variables: {
      instance: {
        type: 'InstanceRef = {space: "", externalId: ""}',
        value: { externalId: 'Aamir Khan', space: headers.space },
      },
    },
  });

  return fdmClient.getInstanceById<{
    getActorById: { items: { externalId: string }[] };
  }>(result, headers);
};
