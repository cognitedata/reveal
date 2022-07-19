import { CogniteClient } from '@cognite/sdk';

import { ExternalId } from '../types';

import { Response, DMSError } from './types';

export const byidsModels = async ({
  client,
  items,
  spaceExternalId,
}: {
  client: CogniteClient;
  items: ExternalId[];
  spaceExternalId: string;
}): Promise<Response<ExternalId> | DMSError> => {
  try {
    const response = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/models/byids`,
      {
        data: { items, spaceExternalId },
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return response;
  } catch (error) {
    // console.error(error);
    return error as DMSError;
  }
};
