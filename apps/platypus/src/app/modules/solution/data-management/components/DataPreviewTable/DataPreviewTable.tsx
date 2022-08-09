import { CogDataGrid, GridConfig } from '@cognite/cog-data-grid';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { usePreviewPageData } from '@platypus-app/modules/solution/data-management/hooks/usePreviewPageData';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
import {
  CellValueChangedEvent,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
} from 'ag-grid-community';
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

  const { t } = useTranslation('DataPreviewTable');
  const [isGridInit, setIsGridInit] = useState(false);
  const [gridConfig, setGridConfig] = useState<GridConfig>(
    getInitialGridConfig()
  );
  const {
    fetchNextPage,
    data: previewData,
    isError,
    updatePreviewData,
    remove: removeQueryFromCache,
  } = usePreviewPageData(
    {
      dataModelId: solutionId,
      dataModelType,
      limit: pageSizeLimit,
      dataModelTypeDefs,
      version,
    },
    true
  );
  useEffect(() => {
    setGridConfig(buildGridConfig(instanceIdCol, dataModelType));
    setIsGridInit(false);

    // re-init grid config only and only when another type is clicked
    // eslint-disable-next-line
  }, [dataModelType.name]);

  useEffect(() => {
    if (!isGridInit) {
      setIsGridInit(true);
      // Removing queryFromCache is necessary to avoid stale data from previous query on a new page
      removeQueryFromCache();
    }
  }, [isGridInit, removeQueryFromCache]);
  const onGridReady = useCallback(
    (grid: GridReadyEvent) => {
      const dataSource = {
        getRows: (params: IGetRowsParams) => {
          return fetchNextPage()
            .then((response) => {
              if (response.data?.pages.length && grid.api) {
                const lastPage =
                  response.data.pages[response.data.pages.length - 1];
                if (!response.hasNextPage) {
                  params.successCallback(
                    lastPage.items,
                    response.data.pages.flatMap((page) => page.items).length
                  );
                } else {
                  params.successCallback(lastPage.items, -1);
                }
              }
            })
            .catch(() => {
              params.failCallback();
            });
        },
      } as IDatasource;
      grid.api.setDatasource(dataSource);
    },
    [fetchNextPage]
  );
  const onCellValueChanged = (e: CellValueChangedEvent) => {
    const { rowIndex, value, colDef } = e;
    const field = colDef.field;
    const flattedData = previewData?.pages.flatMap((page) => page.items);
    const newData = flattedData?.map((el, idx) => {
      if (idx === rowIndex) return { ...el, [field!]: value };
      return el;
    });
    if (newData) {
      updatePreviewData(newData, pageSizeLimit);
    }
  };

  if (!isGridInit) {
    return <Spinner />;
  }

  if (isError) {
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
