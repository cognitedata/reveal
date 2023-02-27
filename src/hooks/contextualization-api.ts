import { useSDK } from '@cognite/sdk-provider';
import { CogniteError, EntityMatchingModel } from '@cognite/sdk';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const getEMModelsKey = (): QueryKey => ['em', 'models'];
export const useEMModels = (
  opts?: UseInfiniteQueryOptions<
    {
      nextCursor?: string;
      items: EntityMatchingModel[];
    },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    getEMModelsKey(),
    ({ pageParam }) => sdk.entityMatching.list({ cursor: pageParam }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
      ...opts,
    }
  );
};

export type Pipeline = {
  id: number;
  name: string;
  description: string;
  owner: string;
};
const getEMPipelinesKey = (): QueryKey => ['em', 'pipelines'];
export const useEMPipelines = (
  opts?: UseQueryOptions<Pipeline[], CogniteError>
) => {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useQuery(
    getEMPipelinesKey(),
    ({ pageParam }) =>
      sdk
        .post<{ items: Pipeline[] }>(
          `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines/list`,
          { params: { nextCursor: pageParam }, data: { limit: 1000 } }
        )
        .then((r) => r.data.items),
    {
      onSuccess(items) {
        items.forEach((i) => qc.setQueryData(getEMPipelineKey(i.id), i));
      },
      ...opts,
    }
  );
};

const getEMPipelineKey = (id: number): QueryKey => ['em', 'pipelines', id];
export const useEMPipeline = (
  id: number,
  opts?: UseQueryOptions<Pipeline, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getEMPipelineKey(id),
    () =>
      sdk
        .post<{ items: Pipeline[]; nextCursor?: string }>(
          `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines/byids`,
          { data: { items: [{ id }] } }
        )
        .then((r) => r.data.items[0]),
    opts
  );
};
