import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import { BASE_QUERY_KEY } from 'common/constants';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { AFlow, Flow } from 'types';
import * as Automerge from '@automerge/automerge';
import { isEqual } from 'lodash';
export const dbKey = (db: string) => [BASE_QUERY_KEY, db];
export const databaseListKey = [BASE_QUERY_KEY, 'database-list'];
export const tableListKey = (db: string) => [...dbKey(db), 'table-list'];

const getFlowListKey = () => ['flow-list'];
export function useFlowList(
  opts?: Omit<UseQueryOptions<FileInfo[], Error>, 'queryKey' | 'queryFn'>
) {
  const sdk = useSDK();
  return useQuery(
    getFlowListKey(),
    async () => {
      return sdk.files
        .list({
          filter: {
            metadata: {
              cdf_flow: 'true',
            },
          },
        })
        .autoPagingToArray({ limit: -1 });
    },
    opts
  );
}

const getFlow = async (sdk: CogniteClient, externalId: string) => {
  const url = await sdk.files
    .getDownloadUrls([{ externalId }])
    .then((r) => r[0]?.downloadUrl);
  if (!url) {
    return Promise.reject(`File '${externalId}' not found`);
  }
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    return Promise.reject(`File '${externalId}' was empty`);
  }
  return Automerge.load<AFlow>(new Uint8Array(buffer));
};

export const getFlowItemKey = (externalId: string) => ['flow', externalId];

export function useFlow(
  externalId: string,
  opts?: Omit<UseQueryOptions<AFlow, Error>, 'queryKey' | 'queryFn'>
) {
  const sdk = useSDK();
  return useQuery(
    getFlowItemKey(externalId),
    () => getFlow(sdk, externalId),
    opts
  );
}

export function useCreateFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    async (flow: Flow) => {
      const { id } = flow;

      const doc = Automerge.from(flow);
      const binary = Automerge.save(doc);
      qc.setQueryData(getFlowItemKey(id), doc);
      const file = await sdk.files.upload(
        {
          externalId: id,
          name: `Flow: ${id}`,
          mimeType: 'application/octet-stream',
          metadata: { cdf_flow: 'true' },
        },
        binary.buffer,
        true
      );
      return file;
    },
    {
      onSettled() {
        qc.invalidateQueries(getFlowListKey());
      },
    }
  );
}

export function useUpdateFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  // const mutate = useCallback(debounce(postFlow, 500), []);
  return useMutation(async (flow: AFlow) => {
    const { id } = flow;
    console.log('save flow');

    let binary = Automerge.save(flow);
    const serverFile = await getFlow(sdk, id);

    if (!isEqual(Automerge.getHeads(flow), Automerge.getHeads(serverFile))) {
      const mergedDoc = Automerge.merge(serverFile, flow);
      qc.setQueryData(getFlowItemKey(id), mergedDoc);
      binary = Automerge.save(mergedDoc);
    }

    await sdk.files.upload(
      {
        externalId: id,
        name: `Flow: ${id}`,
        mimeType: 'application/octet-stream',
        metadata: { cdf_flow: 'true' },
      },
      binary.buffer,
      true
    );
  });
}

export function useDeleteFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    ({ externalId }: { externalId: string }) => {
      return sdk.files.delete([{ externalId }]);
    },
    {
      onSuccess() {
        qc.invalidateQueries(getFlowListKey());
      },
    }
  );
}
