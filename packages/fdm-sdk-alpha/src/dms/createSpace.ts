import { CogniteClient } from '@cognite/sdk';

import { ExternalId } from '../types';

import { Response, DMSError } from './types';

export const createSpace = async ({
  client,
  items,
}: {
  client: CogniteClient;
  items: ExternalId[];
}): Promise<Response<unknown> | DMSError> => {
  try {
    const createModelsResponse = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/spaces`,
      {
        data: {
          items,
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
