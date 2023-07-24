import { useCallback } from 'react';

import { KeyValueMap, StorageProviderType } from '@platypus/platypus-core';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useViewForDataModelType } from '@platypus-app/hooks/useViewForDataModelType';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

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

  const { data: viewForDataModel } = useViewForDataModelType({
    dataModelExternalId,
    dataModelVersion: version,
    space,
    viewExternalId: dataModelType.name,
  });

  const viewVersion = viewForDataModel ? viewForDataModel.version : version;

  const acceptMatches = useCallback(
    async (data: KeyValueMap[]) => {
      if (data.length !== 0) {
        await dataManagementHandler.ingestNodes({
          space,
          model: [dataModelExternalId, `${dataModelType.name}_${viewVersion}`],
          items: data,
          version: viewVersion,
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
      viewVersion,
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
