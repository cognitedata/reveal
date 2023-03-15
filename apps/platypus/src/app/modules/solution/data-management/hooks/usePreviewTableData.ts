import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { DMSRecord } from '@platypus-core/domain/suggestions';
import { useDataModel } from '@platypus-app/hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';

export const usePreviewTableData = (
  dataModelExternalId: string,
  space: string,
  version: string,
  maxNumberOfRecords: number,
  dataModelType?: DataModelTypeDefsType,
  dataModelTypeDefs?: DataModelTypeDefs
) => {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);

  const { data: dataModel } = useDataModel(dataModelExternalId, space);

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(
      version,
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
      const records: DMSRecord[] = [];
      if (!dataModelType || !dataModelTypeDefs) {
        return Promise.resolve(records);
      }

      let cursor = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await dataManagementHandler.fetchData({
          cursor,
          dataModelType,
          dataModelTypeDefs,
          dataModelVersion: selectedDataModelVersion,
          limit: 1000,
          nestedLimit: 2,
        });

        if (response.isFailure) {
          return Promise.reject(response.error);
        }
        const value = response.getValue();
        records.push(...value.items);
        if (records.length > maxNumberOfRecords) {
          return Promise.reject('Exceeding max number of records');
        }
        if (!value.pageInfo.hasNextPage) {
          break;
        }
        cursor = value.pageInfo.cursor;
      }
      return Promise.resolve(records);
    },
    {
      enabled: !!dataModelType && !!dataModelTypeDefs,
    }
  );
};
