import { useMutation, useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  createExtpipeConfigRevision,
  getExtpipeConfig,
  getExtpipeConfigRevisions,
} from 'utils/ExtpipesAPI';
import { ExtpipeConfig, ExtpipeConfigRevision } from 'model/Extpipe';
import { ErrorVariations } from 'model/SDKErrors';

export const useExtpipeConfig = (
  {
    externalId,
    revision,
  }: {
    externalId: string;
    revision?: number;
  },
  options?: Omit<
    UseQueryOptions<ExtpipeConfig, ErrorVariations>,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useSDK();
  return useQuery<ExtpipeConfig, ErrorVariations>(
    ['extpipe', 'config', externalId, revision],
    () => getExtpipeConfig(sdk, externalId, revision),
    options
  );
};

export const useExtpipeConfigRevisions = (
  {
    externalId,
  }: {
    externalId: string;
  },
  options?: Omit<
    UseQueryOptions<ExtpipeConfigRevision[], ErrorVariations>,
    'queryKey' | 'queryFn'
  >
) => {
  const sdk = useSDK();
  return useQuery<ExtpipeConfigRevision[], ErrorVariations>(
    ['extpipe', 'config', 'revisions', externalId],
    () => getExtpipeConfigRevisions(sdk, externalId),
    options
  );
};

export const useCreateConfigRevision = () => {
  const sdk = useSDK();
  return useMutation(
    (opts: { externalId: string; config: string; description?: string }) =>
      createExtpipeConfigRevision(sdk, opts)
  );
};
