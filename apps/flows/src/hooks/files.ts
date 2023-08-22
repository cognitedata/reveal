import * as Automerge from '@automerge/automerge';
import { BASE_QUERY_KEY } from '@flows/common/constants';
import { AFlow, Flow } from '@flows/types';
import { getUserInfo } from '@flows/utils/user';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { isEqual } from 'lodash';

import { CogniteClient, CogniteError, FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
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

export const useFile = useFlow;

export function useFlow(
  externalId: string,
  opts?: Omit<
    UseQueryOptions<AFlow, CogniteError>,
    'queryKey' | 'queryFn' | 'structuralSharing'
  >
) {
  const sdk = useSDK();
  return useQuery<AFlow, CogniteError>(
    getFlowItemKey(externalId),
    () => getFlow(sdk, externalId),
    {
      ...opts,
      structuralSharing(oldData, newData) {
        if (!oldData) {
          return newData;
        }
        if (isEqual(Automerge.getHeads(oldData), Automerge.getHeads(newData))) {
          return oldData;
        }
        return Automerge.merge(newData, oldData);
      },
    }
  );
}

export const useCreateFile = useCreateFlow;

export function useCreateFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    async (flow: Flow) => {
      const { id } = flow;
      const userInfo = await getUserInfo(qc);
      let doc = Automerge.from(flow);
      doc = Automerge.emptyChange(doc, {
        time: Date.now(),
        message: JSON.stringify({
          message: 'Document created',
          user: userInfo?.displayName,
        }),
      });

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
      const mergedFlow = Automerge.merge(serverFlow, flow);
      const binary = Automerge.save(mergedFlow);

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
