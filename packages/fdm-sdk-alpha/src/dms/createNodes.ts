import { CogniteClient } from '@cognite/sdk';

import { ExternalId } from '../types';
import { postDMS } from '../utils/post';

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
    const response = await postDMS({
      client,
      data: {
        spaceExternalId: spaceName,
        model: [spaceName, modelName],
        overwrite: true,
        items,
      },
      url: 'nodes',
    });
    return response;
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
