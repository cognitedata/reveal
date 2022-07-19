import { CogniteClient } from '@cognite/sdk';

import { Response, DMSError } from './types';

export const listModels = async ({
  client,
  spaceExternalId,
}: {
  client: CogniteClient;
  spaceExternalId: string;
}): Promise<Response<unknown> | DMSError> => {
  try {
    const createNodesResponse = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/models/list`,
      {
        data: { spaceExternalId },
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return createNodesResponse;
  } catch (error) {
    // console.error(error);
    return error as DMSError;
  }
};
