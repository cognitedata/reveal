import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';

import { BASE_QUERY_KEY } from 'common';
import { SdkListData } from 'types';
import {
  TransformationCreate,
  TransformationCreateError,
  TransformationRead,
} from 'types/transformation';
import { getTransformationsApiUrl } from 'utils';

type TransformationListQueryParams = {
  includePublic: boolean;
  limit: number;
};

const getTransformationListQueryKey = () => [
  BASE_QUERY_KEY,
  'transformation-list',
];

export const useTransformationList = (
  params: TransformationListQueryParams = {
    includePublic: true,
    limit: 1000,
  },
  options?: UseInfiniteQueryOptions<
    SdkListData<TransformationRead>,
    CogniteError,
    SdkListData<TransformationRead>,
    SdkListData<TransformationRead>,
    string[]
  >
) => {
  const sdk = useSDK();

  return useInfiniteQuery<
    SdkListData<TransformationRead>,
    CogniteError,
    SdkListData<TransformationRead>,
    string[]
  >(
    getTransformationListQueryKey(),
    ({ pageParam = undefined }) =>
      sdk
        .get<SdkListData<TransformationRead>>(getTransformationsApiUrl('/'), {
          params: {
            ...params,
            cursor: pageParam,
          },
        })
        .then(({ data }) => data),
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      ...options,
    }
  );
};
export const useCreateTrasformationKey = () => ['transformations', 'create'];
export const useCreateTransformation = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation<
    TransformationRead,
    TransformationCreateError,
    Pick<TransformationCreate, 'name' | 'externalId' | 'dataSetId'>
  >(
    useCreateTrasformationKey(),
    ({ name, externalId, dataSetId }) =>
      sdk
        .post<{ items: TransformationRead[] }>(getTransformationsApiUrl(), {
          data: {
            items: [
              {
                name,
                externalId: externalId.trim(),
                isPublic: true,
                ...(dataSetId ? { dataSetId } : {}),
              },
            ],
          },
        })
        .then((r) => {
          if (r.status === 200) {
            return r.data.items[0];
          } else {
            return Promise.reject(r);
          }
        }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
      },
    }
  );
};
