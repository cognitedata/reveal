import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { DMSRecord } from '@platypus-core/domain/suggestions';
import { useQuery } from '@tanstack/react-query';

import { useDMContext } from '../../../../context/DMContext';
import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { QueryKeys } from '../../../../utils/queryKeys';

export const usePreviewTableData = (
  maxNumberOfRecords: number,
  dataModelType?: DataModelTypeDefsType
) => {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);

  const {
    typeDefs: dataModelTypeDefs,
    selectedDataModel: selectedDataModelVersion,
  } = useDMContext();

  const {
    space,
    externalId: dataModelExternalId,
    version,
  } = selectedDataModelVersion;
  return useQuery<DMSRecord[]>(
    QueryKeys.PREVIEW_TABLE_DATA(
      space,
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
          return Promise.resolve(records.slice(0, maxNumberOfRecords));
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
