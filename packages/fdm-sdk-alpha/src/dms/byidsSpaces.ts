import { CogniteClient } from '@cognite/sdk';

import { ExternalId } from '../types';

import { Response, DMSError } from './types';

export const byidsSpaces = async ({
  client,
  items,
}: {
  client: CogniteClient;
  items: ExternalId[];
}): Promise<Response<ExternalId> | DMSError> => {
  try {
    const response = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/spaces/byids`,
      {
        data: { items },
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return response;
  } catch (error) {
    return error as DMSError;
  }
};
