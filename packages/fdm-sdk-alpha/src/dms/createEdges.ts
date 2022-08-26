import { CogniteClient } from '@cognite/sdk';

import { postDMS } from '../utils/post';

import { DMSError, Response } from './types';

type Item = {
  externalId: string;
  type: string;
  startNode: string;
  endNode: string;
  //   topTag: string;
  //   isActive: boolean;
  //   weight: number;
  [s: string]: number | string | boolean;
};
type Settings = {
  autoCreateStartNodes?: boolean;
  autoCreateEndNodes?: boolean;
  overwrite?: boolean;
};

export const createEdges = async (
  {
    client,
    items,
    model,
    spaceExternalId,
  }: {
    client: CogniteClient;
    spaceExternalId: string;
    model: [string, string] | [string];
    items: Item[];
  },
  settings: Settings = {
    autoCreateStartNodes: false,
    autoCreateEndNodes: false,
    overwrite: false,
  }
): Promise<Response<unknown> | DMSError> => {
  try {
    const response = await postDMS({
      client,
      data: {
        items,
        model,
        spaceExternalId,
        ...settings,
      },
      url: 'edges',
    });

    return response;
  } catch (error) {
    return error as DMSError;
  }
};
