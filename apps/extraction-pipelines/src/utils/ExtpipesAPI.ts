import { CogniteClient } from '@cognite/sdk';

import {
  Extpipe,
  ExtpipeConfig,
  ExtpipeConfigRevision,
  ExtpipeFieldValue,
  RegisterExtpipeInfo,
} from 'model/Extpipe';
import { ExtpipeAPIResponse } from 'model/ExtpipeAPIResponse';
import { get, post, getBaseUrl } from 'utils/baseURL';

type ExtpipeAPIRequest = {
  limit: number;
  cursor?: string;
};
export const getExtpipes = async (
  sdk: CogniteClient,
  data: ExtpipeAPIRequest
): Promise<ExtpipeAPIResponse> => {
  return (await post<ExtpipeAPIResponse, ExtpipeAPIRequest>(sdk, '/list', data))
    ?.data;
};

export const getExtpipeById = async (
  sdk: CogniteClient,
  extpipeId: number
): Promise<Extpipe> => {
  const extpipe = (await get<Extpipe>(sdk, `/${extpipeId}`))?.data;
  return extpipe;
};

export const getExtpipeConfigRevisions = async (
  sdk: CogniteClient,
  externalId: string,
  limit: number = 100,
  cursor?: string
) =>
  get<{ items: ExtpipeConfigRevision[] }>(
    sdk,
    `/config/revisions`,
    `?externalId=${externalId}&limit=${limit}${
      cursor ? `&cursor=${cursor}` : ''
    }`,
    'playground'
  ).then((r) => r.data.items);

export type CreateConfigRevisionArguments = {
  externalId: string;
  config: string;
  description?: string;
};
export const createExtpipeConfigRevision = async (
  sdk: CogniteClient,
  opts: CreateConfigRevisionArguments
) =>
  post<
    ExtpipeConfigRevision,
    {
      externalId: string;
      config: string;
      description?: string;
    }
  >(sdk, `/config`, opts, '', 'playground').then((r) => r.data);

export const getExtpipeConfig = async (
  sdk: CogniteClient,
  externalId: string,
  {
    revision,
    activeAtTime,
  }: {
    revision?: number;
    activeAtTime?: number;
  } = {}
): Promise<ExtpipeConfig> => {
  return get<ExtpipeConfig>(
    sdk,
    `/config`,
    `?externalId=${externalId}${
      Number.isFinite(revision) ? `&revision=${revision}` : ''
    }${Number.isFinite(activeAtTime) ? `&activeAtTime=${activeAtTime}` : ''}`,
    'playground'
  ).then((r) => r.data);
};

type Update = {
  [key: string]: {
    set: ExtpipeFieldValue;
  };
};

export interface ExtpipeUpdateSpec {
  id: string;
  update: Update;
}

export const saveUpdate = async (
  sdk: CogniteClient,
  items: ExtpipeUpdateSpec[]
) => {
  const response = await sdk.post<ExtpipeAPIResponse>(
    `${getBaseUrl(sdk.project)}/update`,
    {
      data: {
        items,
      },
      withCredentials: true,
    }
  );
  return response.data.items[0];
};

export const registerExtpipe = async (
  sdk: CogniteClient,
  extpipe: Partial<RegisterExtpipeInfo>
) => {
  const response = await sdk.post<ExtpipeAPIResponse>(
    `${getBaseUrl(sdk.project)}`,
    {
      data: {
        items: [extpipe],
      },
      withCredentials: true,
    }
  );
  return response.data.items[0];
};

export const deleteExtractionPipeline = (
  sdk: CogniteClient,
  extPipeId: number
) => {
  return sdk.post(`${getBaseUrl(sdk.project)}/delete`, {
    withCredentials: true,
    responseType: 'text', // <- to avoid trying to parse response as json resulting in errors
    data: {
      items: [{ id: extPipeId }],
    },
  });
};
