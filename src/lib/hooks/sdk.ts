import { QueryKey, useMutation, useQuery, useQueryCache } from 'react-query';
import {
  CogniteClient,
  DataSet,
  FileInfo,
  HttpRequestOptions,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  SdkResourceType,
  useInfiniteList,
  aggregateKey,
  aggregate,
} from '@cognite/sdk-react-query-hooks';
import { isFileOfType } from 'lib/utils/FileUtils';

const post = (sdk: CogniteClient, path: string, data: any) =>
  sdk
    .post(`/api/v1/projects/${sdk.project}${path}`, { data })
    .then(response => response.data);

const get = (
  sdk: CogniteClient,
  path: string,
  data: any,
  options?: HttpRequestOptions
) =>
  sdk
    .get(`/api/v1/projects/${sdk.project}${path}`, { params: data, ...options })
    .then(response => response.data);

export const useCreate = (type: SdkResourceType, options?: any) => {
  const sdk = useSDK();

  return useMutation(
    (data: any | any[]) => {
      const items = Array.isArray(data) ? data : [data];
      return post(sdk, `/${type}`, { items });
    },
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
      onMutate: options?.onMutate,
      onSettled: options?.onSettled,
    }
  );
};
export const useUpdate = (type: SdkResourceType, options?: any) => {
  const sdk = useSDK();

  return useMutation(
    (data: any | any[]) => {
      const items = Array.isArray(data) ? data : [data];
      return post(sdk, `/${type}/update`, { items });
    },
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
      onMutate: options?.onMutate,
      onSettled: options?.onSettled,
    }
  );
};

export const useFileIcon = (file: FileInfo) => {
  const sdk = useSDK();

  return useQuery<ArrayBuffer | undefined>(
    ['cdf', 'file', 'icon', file.id],
    () => {
      if (isFileOfType(file, ['png', 'jpg', 'jpeg', 'tiff', 'gif'])) {
        return get(
          sdk,
          '/files/icon',
          { id: file.id },
          {
            headers: {
              Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            },
            responseType: 'arraybuffer',
          }
        );
      }
      return undefined;
    }
  );
};

export interface DataSetWCount extends DataSet {
  count: number;
}
export const useRelevantDatasets = (
  type: SdkResourceType
): DataSetWCount[] | undefined => {
  const cache = useQueryCache();
  const sdk = useSDK();
  const {
    data,
    isFetching: dataSetsFetching,
    isFetched: dataSetsFetched,
    fetchMore,
    canFetchMore,
  } = useInfiniteList<DataSet>('datasets', 1000);

  if (canFetchMore && !dataSetsFetching) {
    fetchMore();
  }

  const datasets =
    data
      ?.reduce((accl, { items }) => accl.concat(items), [] as DataSet[])
      .sort((a, b) => a.id - b.id) || [];

  const { data: counts, isFetched: aggregateFetched } = useQuery<
    DataSetWCount[]
  >(
    ['dataset-counts', type, datasets?.map(d => d.id)],
    (_: QueryKey, t, dataSetIds: number[]) =>
      Promise.all(
        dataSetIds.map(async (id, index) => {
          const filter = { dataSetIds: [{ id }] };
          const { count } = await cache.fetchQuery(
            aggregateKey(t, filter),
            () => aggregate(sdk, t, filter),
            {
              staleTime: 60 * 1000,
            }
          );
          return {
            ...datasets![index],
            count,
          };
        })
      ),
    {
      enabled: dataSetsFetched && datasets && datasets?.length > 0,
    }
  );

  if (aggregateFetched && counts) {
    return counts
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);
  }
  return undefined;
};
