/*!
 * Copyright 2024 Cognite AS
 */

import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';
import { queryKeys } from '../utilities/queryKeys';
import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';
import { getAddModelOptions } from '../utilities/getAddModelOptions';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>>
): Array<UseQueryResult<AddModelOptions<ClassicDataSourceType>>> => {
  const fdmSdk = useFdmSdk();

  return useQueries({
    queries: addModelOptionsArray.map((addModelOptions) => {
      const addModelOptionsResult = getAddModelOptions(addModelOptions);
      const { modelId, revisionId, revisionExternalId, revisionSpace } =
        addModelOptionsResult ?? {};

      return {
        queryKey: [
          queryKeys.modelRevisionId(),
          modelId ?? revisionExternalId ?? 'unknownModelId',
          revisionId ?? revisionSpace ?? 'unknownRevisionId'
        ],
        queryFn: async () => {
          if (modelId !== undefined && revisionId !== undefined) {
            return { ...addModelOptions, modelId, revisionId };
          }
          if (
            revisionExternalId !== undefined &&
            revisionSpace !== undefined &&
            revisionExternalId !== '' &&
            revisionSpace !== ''
          ) {
            const { modelId: modelIdResult, revisionId: revisionIdResult } =
              await getModelIdAndRevisionIdFromExternalId(
                revisionExternalId,
                revisionSpace,
                fdmSdk
              );
            return { ...addModelOptions, modelId: modelIdResult, revisionId: revisionIdResult };
          }
          return addModelOptions as AddModelOptions<ClassicDataSourceType>;
        },
        staleTime: Infinity
      };
    })
  });
};
