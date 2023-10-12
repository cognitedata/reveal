import { useRef } from 'react';

import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
  KeyValueMap,
  QuerySort,
  PlatypusError,
  Result,
} from '@platypus/platypus-core';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';

import { TOKENS } from '../../../../di';
import { useFilterBuilderFeatureFlag } from '../../../../flags';
import { useInjection } from '../../../../hooks/useInjection';
import { convertToGraphQlFilters } from '../utils/list-data-source-utils';

import { useFetchFilteredRowsCount } from './useFetchFilteredRowsCount';

export type ListDataSourceProps = {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelVersion: DataModelVersion;
  sort?: QuerySort;
  limit: number;
  onError: (error: any) => void;
  onSuccess: (items: KeyValueMap[]) => void;
};

export const useListDataSource = ({
  dataModelType,
  dataModelTypeDefs,
  dataModelVersion,
  limit,
  onError,
  onSuccess,
}: ListDataSourceProps) => {
  const cursor = useRef('');
  const hasNextPage = useRef(false);
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const { isEnabled } = useFilterBuilderFeatureFlag();
  const getFilteredRowsCount = useFetchFilteredRowsCount({
    dataModelExternalId: dataModelVersion.externalId,
    dataModelType,
    space: dataModelVersion.space,
  });

  const dataSource: IDatasource = {
    getRows: async (params: IGetRowsParams) => {
      /*
      startRow will be 0 if we're fetching the first block of data or if we've
      already fetched blocks of data but the ag-grid cache is being refreshed
      or purged. We need to ensure the pagination properties are reset when
      fetching the first block of data.
      */
      if (params.startRow === 0) {
        cursor.current = '';
        hasNextPage.current = false;
      }

      const filterFromColumns = convertToGraphQlFilters(
        params.filterModel,
        dataModelType.fields
      );

      const filter = isEnabled ? params.context.filter : filterFromColumns;

      if (params.context.searchTerm) {
        return dataManagementHandler
          .searchData({
            dataModelType,
            dataModelTypeDefs,
            dataModelVersion,
            limit: 100,
            filter,
            searchTerm: params.context.searchTerm,
          })
          .then((response) => {
            const result = response.getValue();

            params.successCallback(result, result.length);
            getFilteredRowsCount.mutate({
              dataModelType,
              dataModelId: dataModelVersion.externalId,
              version: dataModelVersion.version,
              space: dataModelVersion.space,
              filter: filter ? filter : {},
            });
          })
          .catch((result: Result<PlatypusError>) => {
            params.failCallback();
            onError(result.errorValue());
          });
      } else {
        const sort = params.sortModel.length
          ? {
              fieldName: params.sortModel[0].colId,
              sortType:
                (params.sortModel[0].sort.toUpperCase() as 'ASC' | 'DESC') ||
                'ASC',
            }
          : undefined;

        return dataManagementHandler
          .fetchData({
            cursor: hasNextPage.current ? cursor.current : '',
            dataModelType,
            dataModelTypeDefs,
            dataModelVersion,
            limit,
            filter,
            sort,
            nestedLimit: 2,
          })
          .then((response) => {
            const result = response.getValue();
            hasNextPage.current = result.pageInfo.hasNextPage;
            cursor.current = result.pageInfo.cursor;

            const lastRow = !result.pageInfo.hasNextPage
              ? params.startRow + result.items.length
              : -1;

            onSuccess(result.items);
            getFilteredRowsCount.mutate({
              dataModelType,
              dataModelId: dataModelVersion.externalId,
              version: dataModelVersion.version,
              filter: filter ? filter : {},
              space: dataModelVersion.space,
            });
            params.successCallback(result.items, lastRow);
          })
          .catch((result: Result<PlatypusError>) => {
            params.failCallback();
            onError(result.errorValue());
          });
      }
    },
  };

  return dataSource;
};
