import { useQueries, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import {
  type AddModelOptions,
  type ClassicDataSourceType,
  type DataSourceType
} from '@cognite/reveal';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { getModelKeys } from '../utilities/getModelKeys';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';
import { isClassicIdentifier, isDM3DModelIdentifier } from '../components';
import { queryKeys } from '../utilities/queryKeys';

export function useQueriedAddModelOptions(
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>> | undefined,
  fdmSdk: FdmSDK
): Array<UseQueryResult<AddModelOptions<ClassicDataSourceType>>> {
  return useQueries({
    queries:
      addModelOptionsArray?.map((addModelOptions) => createQueryConfig(addModelOptions, fdmSdk)) ??
      []
  });
}

const createQueryConfig = (
  addModelOptions: AddModelOptions<DataSourceType>,
  fdmSdk: FdmSDK
): UseQueryOptions<AddModelOptions<ClassicDataSourceType>> => {
  const modelKeys = getModelKeys([addModelOptions]);
  if (isClassicIdentifier(addModelOptions)) {
    return {
      queryKey: [queryKeys.modelRevisionId(modelKeys)],
      queryFn: async () => await Promise.resolve(addModelOptions),
      staleTime: Infinity
    };
  }

  if (isDM3DModelIdentifier(addModelOptions)) {
    return {
      queryKey: [queryKeys.modelRevisionId(modelKeys)],
      queryFn: async () => {
        const { modelId, revisionId } = await getModelIdAndRevisionIdFromExternalId(
          addModelOptions.revisionExternalId,
          addModelOptions.revisionSpace,
          fdmSdk
        );
        return {
          ...addModelOptions,
          modelId,
          revisionId
        };
      },
      staleTime: Infinity
    };
  }

  return {
    queryKey: [queryKeys.modelRevisionId(modelKeys)],
    queryFn: async () => await Promise.reject(new Error('Unknown identifier type')),
    staleTime: Infinity
  };
};
