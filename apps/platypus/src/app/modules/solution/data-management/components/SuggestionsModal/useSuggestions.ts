import { useCallback } from 'react';

import { KeyValueMap, StorageProviderType } from '@platypus/platypus-core';
import { useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../../../di';
import { useInjection } from '../../../../../hooks/useInjection';
import { QueryKeys } from '../../../../../utils/queryKeys';
import { DataPreviewTableProps } from '../DataPreviewTable/DataPreviewTable';

const REJECTED_SUGGESTIONS_KEY = 'REJECTED_SUGGESTIONS';

export const useSuggestions = ({
  dataModelType,
  dataModelTypeDefs,
  dataModelExternalId,
  version,
  space,
}: DataPreviewTableProps) => {
  const queryClient = useQueryClient();
  const sessionStorageHandler = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.sessionStorage);
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);

  const acceptMatches = useCallback(
    async (data: KeyValueMap[]) => {
      if (data.length !== 0 && dataModelType.version) {
        await dataManagementHandler.ingestNodes({
          space,
          instanceSpace: space,
          model: [
            dataModelExternalId,
            `${dataModelType.name}_${dataModelType.version}`,
          ],
          items: data,
          version: dataModelType.version,
          dataModelExternalId,
          dataModelType,
          dataModelTypeDefs,
        });
        queryClient.invalidateQueries(
          QueryKeys.PREVIEW_TABLE_DATA(
            space,
            dataModelExternalId,
            dataModelType.name,
            version
          )
        );
      }
    },
    [
      dataManagementHandler,
      queryClient,
      dataModelExternalId,
      dataModelType,
      version,
      dataModelTypeDefs,
      space,
    ]
  );

  const getRejectedMatches = useCallback(
    () =>
      sessionStorageHandler.getItem(
        `${REJECTED_SUGGESTIONS_KEY}-${dataModelExternalId}-${version}-${dataModelType.name}`
      ) || [],
    [sessionStorageHandler, dataModelType.name, dataModelExternalId, version]
  );

  const rejectMatches = useCallback(
    async (rejected: string[]) => {
      sessionStorageHandler.setItem(
        `${REJECTED_SUGGESTIONS_KEY}-${dataModelExternalId}-${version}-${dataModelType.name}`,
        rejected
      );
    },
    [sessionStorageHandler, dataModelType.name, dataModelExternalId, version]
  );

  return { acceptMatches, rejectMatches, getRejectedMatches };
};
