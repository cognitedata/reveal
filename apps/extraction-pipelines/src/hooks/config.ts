import {
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  UseQueryOptions,
} from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  CreateConfigRevisionArguments,
  createExtpipeConfigRevision,
  getExtpipeConfig,
  getExtpipeConfigRevisions,
} from 'utils/ExtpipesAPI';
import { ExtpipeConfig, ExtpipeConfigRevision } from 'model/Extpipe';
import { CogniteError } from '@cognite/sdk';

type ExtPipeConfigRequest = {
  externalId: string;
  revision?: number;
  activeAtTime?: number;
};
export const useExtpipeConfig = (
  { externalId, revision, activeAtTime }: ExtPipeConfigRequest,
  options?: Omit<
    UseQueryOptions<ExtpipeConfig, CogniteError>,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useSDK();
  return useQuery<ExtpipeConfig, CogniteError>(
    ['extpipe', 'config', externalId, { revision, activeAtTime }],
    () => getExtpipeConfig(sdk, externalId, { revision, activeAtTime }),
    options
  );
};

export const useExtpipeConfigs = (
  reqs: ExtPipeConfigRequest[],
  options?: { enabled?: boolean }
) => {
  const sdk = useSDK();

  return useQueries(
    reqs.map(({ externalId, activeAtTime, revision }) => ({
      queryKey: ['extpipe', 'config', externalId, { revision, activeAtTime }],
      queryFn: () =>
        getExtpipeConfig(sdk, externalId, { revision, activeAtTime }),
      ...options,
    }))
  );
};

export const useExtpipeConfigRevisions = (
  {
    externalId,
  }: {
    externalId: string;
  },
  options?: Omit<
    UseQueryOptions<ExtpipeConfigRevision[], CogniteError>,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useSDK();
  return useQuery<ExtpipeConfigRevision[], CogniteError>(
    ['extpipe', 'config', 'revisions', externalId],
    () => getExtpipeConfigRevisions(sdk, externalId),
    options
  );
};

export const useCreateConfigRevision = (
  opts?: Omit<
    UseMutationOptions<void, CogniteError, CreateConfigRevisionArguments>,
    'mutationFn' | 'mutationKey'
  >
) => {
  const sdk = useSDK();
  return useMutation<void, CogniteError, CreateConfigRevisionArguments>({
    mutationFn: async (o: CreateConfigRevisionArguments) => {
      await createExtpipeConfigRevision(sdk, o);
    },
    mutationKey: ['create-config-revision'],
    ...opts,
  });
};
