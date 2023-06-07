import { AggregateResponse, CogniteClient } from '@cognite/sdk';

import { SdkResourceType } from './hooks';

export const post = (sdk: CogniteClient, path: string, data: any) =>
  sdk
    .post(`/api/v1/projects/${sdk.project}${path}`, { data })
    .then((response) => response.data);

/**
 * The aggregate APIs are a bit strange, filtering on irrelevant data
 * set ids results in { items: [{ count: 0 }]} and invalid data set
 * ids results in { items: [] }.
 */
export const aggregateApi = (
  sdk: CogniteClient,
  type: SdkResourceType,
  filter: any
): Promise<AggregateResponse> =>
  post(sdk, `/${type}/aggregate`, { filter }).then(
    (data) => data?.items[0] || { count: 0 }
  );

export const listApi = (sdk: CogniteClient, type: SdkResourceType, body: any) =>
  post(sdk, `/${type}/list`, body).then((data) => data?.items);

const getSearchArgs = (type: SdkResourceType, query: string) => {
  switch (type) {
    case 'files':
      return { name: query };
    case 'events':
      return { description: query };
    default:
      return { query };
  }
};
export const searchApi = <T>(
  sdk: CogniteClient,
  type: SdkResourceType,
  query: string,
  body?: any
): Promise<T[]> => {
  return post(sdk, `/${type}/search`, {
    ...body,
    search: getSearchArgs(type, query),
  }).then((r) => r?.items);
};
