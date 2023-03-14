import { CogDataTable } from '@cognite/cog-data-grid';
import { Pagination } from '@cognite/cogs.js';
import { DataModel, StorageProviderType } from '@platypus/platypus-core';
import { RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  useMemo,
  useRef,
  useCallback,
  ForwardedRef,
  useImperativeHandle,
} from 'react';
import { useDataModelsGridConfig } from '../../hooks/useDataModelsGridConfig';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { PaginationWrapper } from './elements';
import React from 'react';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { useNavigate } from '@platypus-app/flags/useNavigate';

const RESULTS_PER_PAGE = 25;

export interface DataModelsTableProps {
  dataModels: DataModel[];
  onDelete: (dataModel: DataModel) => void;
  filteredRowCount: number;
}

export const DataModelsTable = React.forwardRef(
  (props: DataModelsTableProps, forwardRef: ForwardedRef<AgGridReact>) => {
    const gridRef = useRef<AgGridReact>(null);

    useImperativeHandle(forwardRef, () => gridRef.current as any);

    const localStorageProvider = useInjection(
      TOKENS.storageProviderFactory
    ).getProvider(StorageProviderType.localStorage);

    const navigate = useNavigate();
    const { getColDefs, getGridOptions } = useDataModelsGridConfig();

    // eslint-disable-next-line
    const colDefs = useMemo(() => getColDefs(), []);

    // eslint-disable-next-line
    const gridOptions = useMemo(() => getGridOptions(), []);

    const dataModelsWithDrafts = useMemo(() => {
      const modelsWithDrafts = localStorageProvider
        .getKeys()
        .filter((key: string) => key.endsWith('_drafts'))
        .filter((key: string) => {
          const contents = localStorageProvider.getItem(key);
          if (!contents || (Array.isArray(contents) && !contents.length)) {
            return false;
          }

          return true;
        })
        .map((key: string) => key.replace('_drafts', ''));

      return modelsWithDrafts;
    }, [localStorageProvider]);

    const totalPages = useMemo(
      () => Math.ceil(props.filteredRowCount / RESULTS_PER_PAGE),
      [props.filteredRowCount]
    );

    const handleRowClicked = useCallback((event: RowClickedEvent) => {
      const dataModel = event.data as DataModel;
      navigate(`/${dataModel.space}/${dataModel.id}/${DEFAULT_VERSION_PATH}`);
      // eslint-disable-next-line
    }, []);

    return (
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CogDataTable
          ref={gridRef}
          rowData={props.dataModels}
          columnDefs={colDefs}
          {...gridOptions}
          context={{
            dataModelsWithDrafts: dataModelsWithDrafts || [],
            onDelete: props.onDelete,
          }}
          wrapperStyle={{ height: 'calc(100% - 100px)' }}
          theme="basic-striped"
          pagination={true}
          paginationPageSize={RESULTS_PER_PAGE}
          suppressPaginationPanel={true}
          onRowClicked={handleRowClicked}
          onGridReady={(e) => e.api.sizeColumnsToFit()}
        />
        {totalPages > 1 ? (
          <PaginationWrapper>
            <Pagination
              totalPages={totalPages}
              itemsPerPage={RESULTS_PER_PAGE}
              size="small"
              hideItemsPerPage
              onPageChange={(pageNumber) => {
                if (gridRef && gridRef.current) {
                  gridRef?.current?.api.paginationGoToPage(pageNumber - 1);
                }
              }}
            />
          </PaginationWrapper>
        ) : null}
      </div>
    );
  }
);
