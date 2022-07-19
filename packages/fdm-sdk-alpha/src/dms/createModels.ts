import { CogniteClient } from '@cognite/sdk';

import { DMSError, Response } from './types';

type Field = Record<string, boolean | string | number>;
type Model = {
  externalId: string;
  properties: Record<string, Field>;
};

export const createModels = async ({
  client,
  items,
  spaceExternalId,
}: {
  client: CogniteClient;
  spaceExternalId: string;
  items: Model[];
}): Promise<Response<unknown> | DMSError> => {
  try {
    const createModelsResponse = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/models`,
      {
        data: {
          items,
          spaceExternalId,
        },
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return createModelsResponse;
  } catch (error) {
    return error as DMSError;
  }
};
