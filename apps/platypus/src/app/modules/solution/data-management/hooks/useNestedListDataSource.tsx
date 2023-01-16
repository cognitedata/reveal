import { PrimitiveTypes } from '@cognite/cog-data-grid';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
  KeyValueMap,
  PlatypusError,
  Result,
} from '@platypus/platypus-core';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import noop from 'lodash/noop';
import { useMemo, useRef } from 'react';

export type ListDataSourceProps = {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelVersion: DataModelVersion;
  onError?: (error: any) => void;
};

export const useNestedListDataSource = ({
  dataModelType,
  dataModelTypeDefs,
  dataModelVersion,
  onError,
}: ListDataSourceProps) => {
  const cursor = useRef('');
  const hasNextPage = useRef(false);
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const dataSource: IDatasource = useMemo(
    () => ({
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
        const searchTerm = params.context.searchTerm;
        const limit = params.context.limit;
        const externalId = params.context.externalId;
        const field = params.context.field;
        const isCustomType = params.context.isCustomType;
        const defaultData = params.context.defaultData;

        if (isCustomType) {
          return dataManagementHandler
            .getDataById({
              nestedCursors: {
                [field]: hasNextPage.current ? cursor.current : '',
              },
              nestedFilters: {
                [field]:
                  searchTerm && isCustomType
                    ? { externalId: { eq: searchTerm } }
                    : {},
              },
              externalId,
              dataModelType,
              dataModelTypeDefs,
              dataModelVersion,
              nestedLimit: limit,
              limitFields: [field],
            })
            .then((response) => {
              const result = response.getValue();
              hasNextPage.current = result[field].pageInfo.hasNextPage;
              cursor.current = result[field].pageInfo.endCursor;

              const lastRow = !result[field].pageInfo.hasNextPage
                ? params.startRow + result[field].items.length
                : -1;

              const callbackData = result[field].items.map(
                (el: { externalId: string }) => ({
                  value: el.externalId,
                })
              );
              params.successCallback(callbackData, lastRow);
            })
            .catch((result: Result<PlatypusError>) => {
              params.failCallback();
              (onError || noop)(result.errorValue());
            });
        } else {
          // could be a list of primitives or of JSON objects; if the latter, stringify
          const listData = (
            defaultData![field] as string[] | KeyValueMap[]
          ).map((item) =>
            typeof item === 'object' ? JSON.stringify(item) : item
          );

          const results = searchTerm
            ? listData.filter((el: PrimitiveTypes) =>
                `${el}`.toLowerCase().includes(`${searchTerm}`.toLowerCase())
              )
            : listData;
          const callbackData = results.map((el: PrimitiveTypes) => ({
            value: el,
          }));
          params.successCallback(
            callbackData,
            params.startRow + results.length
          );
        }
      },
    }),
    [
      dataManagementHandler,
      onError,
      dataModelType,
      dataModelTypeDefs,
      dataModelVersion,
    ]
  );

  return dataSource;
};
