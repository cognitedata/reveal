import { CogniteClient } from '@cognite/sdk';

import { postDMS } from '../utils/post';

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
