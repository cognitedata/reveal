import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient, CogniteError, FileInfo } from '@cognite/sdk';
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
      onSuccess(fileInfo) {
        const list = qc.getQueryData<FileInfo[]>(getFlowListKey()) || [];
        qc.setQueryData(getFlowListKey(), [...list, fileInfo]);
      },
    }
  );
}

export function useUpdateFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(async (flow: AFlow) => {
    const { id } = flow;

    const serverFlow = await getFlow(sdk, id);

    if (!isEqual(Automerge.getHeads(flow), Automerge.getHeads(serverFlow))) {
      const binary = Automerge.save(Automerge.merge(serverFlow, flow));
      /*
       *This seems silly, but currently this is an issue:
       * ```
       * const mergedDoc = AM.merge(flow, serverFlow);
       * const binary = AM.save(mergedFlow);
       * AM.load(binary).canvas.nodes[x].position.y !== mergedDoc.canvas.nodes[x].position.y
       * ```
       *
       * Serializing the merged document and unserializing it leads to a different result that the
       * original merged doc (where there are conflicts). Instead, serialize the merged flow
       * immediatly and unserialize it and set that in the query cache. That (seems to) ensure that
       * the server version and local version match.
       */
      const mergedFlow = Automerge.load<AFlow>(binary);
      qc.setQueryData(getFlowItemKey(id), mergedFlow);
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
    }
  });
}

export function useDeleteFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation<void, CogniteError, { externalId: string }>(
    ['delete-file'],
    async ({ externalId }) => {
      await sdk.files.delete([{ externalId }]);
    },
    {
      onSuccess(_, { externalId }) {
        const list = qc.getQueryData<FileInfo[]>(getFlowListKey());
        qc.setQueryData(
          getFlowListKey(),
          list?.filter((f) => f.externalId !== externalId)
        );
      },
    }
  );
}
