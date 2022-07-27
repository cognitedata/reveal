import { CogniteClient } from '@cognite/sdk';

import { ExternalId } from '../types';

import { DMSError, Response } from './types';

type Node = {
  [field: string]: boolean | string | number;
} & ExternalId;

export const createNodes = async ({
  client,
  items,
  modelName,
  spaceName,
}: {
  client: CogniteClient;
  items: Node[];
  spaceName: string;
  modelName: string;
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
    // cdf client is breaking our errors
    // convert it back
    return {
      error: {
        code: 500,
        message: (error as Error).message,
      },
    } as DMSError;
  }
};
