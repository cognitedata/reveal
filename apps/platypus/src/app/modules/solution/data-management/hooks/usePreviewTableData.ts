import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { DMSRecord } from '@platypus-core/domain/suggestions';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';

export const usePreviewTableData = (
  dataModelExternalId: string,
  version: string,
  dataModelType?: DataModelTypeDefsType,
  dataModelTypeDefs?: DataModelTypeDefs
) => {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);

  const { data: dataModel } = useDataModel(dataModelExternalId);
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    version,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );
  return useQuery<DMSRecord[]>(
    QueryKeys.PREVIEW_TABLE_DATA(
      dataModelExternalId,
      dataModelType?.name || 'undefined',
      version
    ),
    async () => {
      if (!dataModelType || !dataModelTypeDefs) {
        return Promise.resolve([]);
      }
      return await dataManagementHandler
        .fetchData({
          cursor: '',
          hasNextPage: false,
          dataModelType,
          dataModelTypeDefs,
          dataModelVersion: selectedDataModelVersion,
          limit: 1000, // currently just assume taking the first 1000 items
        })
        .then((response) => {
          return response.getValue().items as DMSRecord[];
        });
    },
    {
      enabled: !!dataModelType && !!dataModelTypeDefs,
    }
  );
};
