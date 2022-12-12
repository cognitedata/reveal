import { useCallback } from 'react';
import { DataPreviewTableProps } from '../DataPreviewTable/DataPreviewTable';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { KeyValueMap, StorageProviderType } from '@platypus/platypus-core';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@platypus-app/utils/queryKeys';

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
      if (data.length !== 0) {
        await dataManagementHandler.ingestNodes({
          space,
          model: [dataModelExternalId, `${dataModelType.name}_${version}`],
          items: data,
          dataModelExternalId,
          dataModelType,
          dataModelTypeDefs,
        });
        queryClient.invalidateQueries(
          QueryKeys.PREVIEW_TABLE_DATA(
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
