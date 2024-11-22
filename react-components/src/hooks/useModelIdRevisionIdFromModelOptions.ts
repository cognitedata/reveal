/*!
 * Copyright 2024 Cognite AS
 */

import { useQueries, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';
import { queryKeys } from '../utilities/queryKeys';
import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { isClassicIdentifier, isDMIdentifier } from '../components';
import { type FdmSDK } from '../data-providers/FdmSDK';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>>
): Array<UseQueryResult<AddModelOptions<ClassicDataSourceType>>> => {
  const fdmSdk = useFdmSdk();

  return useQueries({
    queries: addModelOptionsArray.map((addModelOptions) =>
      createQueryConfig(addModelOptions, fdmSdk)
    )
  });
};

const createQueryConfig = (
  addModelOptions: AddModelOptions<DataSourceType>,
  fdmSdk: FdmSDK
): UseQueryOptions<AddModelOptions<ClassicDataSourceType>> => {
  if (isClassicIdentifier(addModelOptions)) {
    return {
      queryKey: [queryKeys.modelRevisionId(), addModelOptions.modelId, addModelOptions.revisionId],
      queryFn: async () => await Promise.resolve(addModelOptions),
      staleTime: Infinity
    };
  }

  if (isDMIdentifier(addModelOptions)) {
    return {
      queryKey: [
        queryKeys.modelRevisionId(),
        addModelOptions.revisionExternalId,
        addModelOptions.revisionSpace
      ],
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
    queryKey: [queryKeys.modelRevisionId(), 'unknown', 'unknown'],
    queryFn: async () => await Promise.reject(new Error('Unknown identifier type')),
    staleTime: Infinity
  };
};
