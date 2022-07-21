import { CogDataGrid, GridConfig } from '@cognite/cog-data-grid';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  KeyValueMap,
  DataModelTypeDefsType,
  DataModelTypeDefs,
} from '@platypus/platypus-core';
import { GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { useCallback, useEffect, useState } from 'react';

import {
  buildGridConfig,
  getInitialGridConfig,
} from '../../services/grid-config-builder';
import { ErrorPlaceholder } from './ErrorPlaceholder';
import noRowsOverlay from './NoRowsOverlay';

const pageSizeLimit = 100;

export interface DataPreviewTableProps {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  solutionId: string;
  version: string;
}
export const DataPreviewTable = ({
  dataModelType,
  dataModelTypeDefs,
  solutionId,
  version,
}: DataPreviewTableProps) => {
  const instanceIdCol = 'externalId';

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);

  const { t } = useTranslation('DataPreviewTable');
  const [isGridInit, setIsGridInit] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<KeyValueMap[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfig>(
    getInitialGridConfig()
  );

  useEffect(() => {
    setGridConfig(buildGridConfig(instanceIdCol, dataModelType));
    setIsGridInit(false);
    setHasError(false);
  }, [dataModelType]);

  useEffect(() => {
    if (!isGridInit) {
      setIsGridInit(true);
    }
  }, [isGridInit]);

  const onCellValueChanged = (e: any) => {
    const { rowIndex, value, colDef } = e;
    const field = colDef.field;

    const newData = data.map((el, idx) => {
      if (idx === rowIndex) return { ...el, [field]: value };
      return el;
    });

    setData(newData);
  };
  const onGridReady = useCallback(
    (gridReadyEvent: GridReadyEvent) => {
      let cursor = '';
      let nextPage = false;
      const dataSource = {
        rowCount: undefined,
        getRows: (params: IGetRowsParams) => {
          dataManagementHandler
            .fetchData({
              cursor,
              dataModelType,
              dataModelTypeDefs,
              hasNextPage: nextPage,
              limit: pageSizeLimit,
              dataModelId: solutionId,
              version,
            })
            .then((result) => {
              const fetchedData = result.getValue();
              cursor = fetchedData.pageInfo.cursor;
              nextPage = fetchedData.pageInfo.hasNextPage;
              let rowCount;

              if (fetchedData.items.length === 0) {
                rowCount = 1;
              } else if (!fetchedData.pageInfo.hasNextPage) {
                rowCount = Math.max(
                  gridReadyEvent.api.getDisplayedRowCount() + 1,
                  fetchedData.items.length
                );
              }

              params.successCallback(fetchedData.items, rowCount);
            })
            .catch((errResponse) => {
              const error = errResponse.error;
              Notification({
                type: 'error',
                message: error.message,
                validationErrors: error.errors,
              });
              setHasError(true);
              params.failCallback();
            });
        },
      } as IDatasource;
      gridReadyEvent.api.setDatasource(dataSource);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataModelType]
  );

  if (!isGridInit) {
    return <Spinner />;
  }

  if (hasError) {
    return (
      <FlexPlaceholder
        data-cy="data-preview-error"
        title={t('error-loading-data-title', 'Unable to load the preview')}
        description={t(
          'error-loading-data-body',
          'Something went wrong and we were notified about it. The data preview can not be created for this type. Please try to refresh the page or select another type.'
        )}
      />
    );
  }

  return (
    <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
      <div style={{ height: '100%' }} data-cy="data-preview-table">
        <CogDataGrid
          gridOptions={{
            rowModelType: 'infinite',
            rowBuffer: pageSizeLimit / 2,
            // how big each page in our page cache will be, default is 100
            cacheBlockSize: pageSizeLimit,
            maxConcurrentDatasourceRequests: 2,
            noRowsOverlayComponentFramework: noRowsOverlay,
          }}
          rowNodeId={instanceIdCol}
          config={gridConfig}
          onCellValueChanged={onCellValueChanged}
          onGridReady={onGridReady}
        />
      </div>
    </ErrorBoundary>
  );
};
