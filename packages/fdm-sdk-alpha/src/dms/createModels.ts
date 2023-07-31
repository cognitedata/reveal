import { CogniteClient } from '@cognite/sdk';

import { postDMS } from '../utils/post';

import { DMSError, DMSModel, Response } from './types';

export const createModels = async ({
  client,
  items,
  spaceExternalId,
}: {
  client: CogniteClient;
  spaceExternalId: string;
  items: DMSModel[];
}): Promise<Response<unknown> | DMSError> => {
  try {
    const response = await postDMS({
      client,
      data: {
        items,
        spaceExternalId,
      },
      url: 'models',
    });
    return response;
  } catch (error) {
    return error as DMSError;
  }
};
