import { CogniteClient } from '@cognite/sdk';

import { postDMS } from '../utils/post';
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
    const response = await postDMS({
      client,
      data: {
        items,
      },
      url: 'spaces',
    });
    return response;
  } catch (error) {
    return error as DMSError;
  }
};
