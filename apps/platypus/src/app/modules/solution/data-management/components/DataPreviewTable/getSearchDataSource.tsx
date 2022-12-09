import { rootInjector, TOKENS } from '@platypus-app/di';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
  PlatypusError,
  Result,
} from '@platypus/platypus-core';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';

export type SearchDataSourceProps = {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelVersion: DataModelVersion;
  limit: number;
  onError: (error: PlatypusError) => void;
  searchTerm: string;
};

const dataManagementHandler = rootInjector.get(TOKENS.DataManagementHandler);

export const getSearchDataSource = ({
  dataModelType,
  dataModelTypeDefs,
  dataModelVersion,
  limit,
  onError,
  searchTerm,
}: SearchDataSourceProps) => {
  const dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      return dataManagementHandler
        .searchData({
          dataModelVersion,
          dataModelType,
          dataModelTypeDefs,
          limit,
          searchTerm,
        })
        .then((response) => {
          const result = response.getValue();

          params.successCallback(result, result.length);
        })
        .catch((result: Result<PlatypusError>) => {
          params.failCallback();
          onError(result.errorValue());
        });
    },
  };

  return dataSource;
};
