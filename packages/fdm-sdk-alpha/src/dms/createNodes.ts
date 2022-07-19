import { CogniteClient } from '@cognite/sdk';

import { DMSError, Response } from './types';

type ExternalId = { externalId: string };
type Node = {
  [field: string]: Record<string, boolean | string | number>;
} & ExternalId;

export const createNodes = async ({
  client,
  modelName,
  items,
  spaceName,
}: {
  client: CogniteClient;
  spaceName: string;
  modelName: string;
  items: Node[];
}): Promise<Response<unknown> | DMSError> => {
  try {
    const createNodesResponse = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/nodes`,
      {
        data: {
          spaceExternalId: spaceName,
          model: [spaceName, modelName],
          overwrite: true,
          items,
        },
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return createNodesResponse;
  } catch (error) {
    return error as DMSError;
  }
};
