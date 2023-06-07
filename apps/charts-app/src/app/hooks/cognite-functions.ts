import { useSDK } from '@cognite/sdk-provider';
import {
  retrieveItemsKey,
  SdkResourceType,
} from '@cognite/sdk-react-query-hooks';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { useQuery, UseQueryOptions } from 'react-query';

type ErrorResponse = { message?: string };

const post = (sdk: CogniteClient, path: string, data: any) =>
  sdk
    .post(`/api/v1/projects/${sdk.project}${path}`, { data })
    .then((response) => response.data);

export const useCdfItems = <T>(
  type: SdkResourceType,
  ids: IdEither[],
  ignoreUnknownIds = false,
  config?: UseQueryOptions<T[], ErrorResponse>
) => {
  const sdk = useSDK();
  const filteredIds = ids.filter((i: any) => !!i.id || !!i.externalId);

  return useQuery<T[], ErrorResponse>(
    retrieveItemsKey(type, filteredIds),
    () => {
      if (filteredIds.length > 0) {
        return post(sdk, `/${type}/byids`, {
          items: filteredIds,
          ignoreUnknownIds,
        }).then((d) => d?.items);
      }
      return [];
    },
    config
  );
};
