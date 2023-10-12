import React, {
  useMemo,
  useRef,
  useCallback,
  ForwardedRef,
  useImperativeHandle,
} from 'react';

import { DataModel, StorageProviderType } from '@platypus/platypus-core';
import { RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { CogDataTable } from '@cognite/cog-data-grid';
import { Pagination } from '@cognite/cogs.js';

import { TOKENS } from '../../../../di';
import { useNavigate } from '../../../../flags/useNavigate';
import { useInjection } from '../../../../hooks/useInjection';
import { useMixpanel } from '../../../../hooks/useMixpanel';
import { DEFAULT_VERSION_PATH } from '../../../../utils/config';
import { useDataModelsGridConfig } from '../../hooks/useDataModelsGridConfig';

import { PaginationWrapper } from './elements';

const RESULTS_PER_PAGE = 25;

export interface DataModelsTableProps {
  dataModels: DataModel[];
  onDelete: (dataModel: DataModel) => void;
  filteredRowsCount: number;
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

    const { track } = useMixpanel();

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
      () => Math.ceil(props.filteredRowsCount / RESULTS_PER_PAGE),
      [props.filteredRowsCount]
    );

    const handleRowClicked = useCallback((event: RowClickedEvent) => {
      const dataModel = event.data as DataModel;
      track('DataModel.Select');
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
