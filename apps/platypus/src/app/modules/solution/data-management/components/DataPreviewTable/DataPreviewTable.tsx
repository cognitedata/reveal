import {
  CogDataGrid,
  CogDataList,
  GridConfig,
  PrimitiveTypesListData,
} from '@cognite/cog-data-grid';
import { Body, CollapsablePanel, Title } from '@cognite/cogs.js';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DraftRowData } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  KeyValueMap,
  PlatypusError,
} from '@platypus/platypus-core';
import {
  CellEditingStartedEvent,
  ColDef,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  RowDataUpdatedEvent,
  ValueSetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';
import { useDraftRows } from '../../hooks/useDraftRows';
import { useNodesDeleteMutation } from '../../hooks/useNodesDeleteMutation';
import { usePublishedRowsCountMapByType } from '../../hooks/usePublishedRowsCountMapByType';
import {
  buildGridConfig,
  getInitialGridConfig,
} from '../../services/grid-config-builder';
import { CreateTransformationModal } from '../CreateTransformationModal';
import { DeleteRowsModal } from '../DeleteRowsModal/DeleteRowsModal';
import { PreviewPageHeader } from '../PreviewPageHeader/PreviewPageHeader';
import {
  StyledCollapsablePanelContainer,
  StyledDataPreviewTable,
} from './elements';
import { ErrorPlaceholder } from './ErrorPlaceholder';
import { NoRowsOverlay } from './NoRowsOverlay';
import { SidePanel } from './SidePanel';
import { sanitizeRow } from './utils';

const pageSizeLimit = 100;

export interface DataPreviewTableProps {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelExternalId: string;
  version: string;
}

export type DataPreviewTableRef = {
  purgeInfiniteCache: () => void;
};

export const DataPreviewTable = forwardRef<
  DataPreviewTableRef,
  DataPreviewTableProps
>(({ dataModelType, dataModelTypeDefs, dataModelExternalId, version }, ref) => {
  const instanceIdCol = 'externalId';

  const { t } = useTranslation('DataPreviewTable');
  const [isGridInit, setIsGridInit] = useState(false);
  const [isTransformationModalVisible, setIsTransformationModalVisible] =
    useState(false);
  // This property is used to trigger a rerender when a selection occurs in the grid
  const [, setSelectedPublishedRowsCount] = useState(0);
  const gridRef = useRef<AgGridReact>(null);
  const [fetchError, setFetchError] = useState(null);
  const [gridConfig, setGridConfig] = useState<GridConfig>(
    getInitialGridConfig()
  );
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);

  const draftRowsData = useSelector(
    (state) => state.dataManagement.draftRows[dataModelType.name] || []
  );

  const { shouldShowDraftRows, shouldShowPublishedRows } = useSelector(
    (state) => ({
      shouldShowDraftRows: state.dataManagement.shouldShowDraftRows,
      shouldShowPublishedRows: state.dataManagement.shouldShowPublishedRows,
    })
  );

  const { updateRowData, removeDrafts, createNewDraftRow, deleteSelectedRows } =
    useDraftRows();

  const {
    toggleShouldShowDraftRows,
    toggleShouldShowPublishedRows,
    onShowNoRowsOverlay,
    onHideOverlay,
  } = useDataManagementPageUI();
  const selectedDraftRows = draftRowsData.filter((row) => row._isDraftSelected);
  const selectedPublishedRowsCount = gridRef.current?.api
    ? gridRef.current?.api?.getSelectedRows().length
    : 0;
  const totalSelectedRowCount =
    selectedDraftRows.length + selectedPublishedRowsCount;
  let singleSelectedRowExternalId: string | undefined;
  if (totalSelectedRowCount === 1) {
    const selectedRow =
      selectedDraftRows[0] || gridRef.current?.api?.getSelectedRows()[0];
    singleSelectedRowExternalId = selectedRow.externalId;
  }

  const [isDeleteRowsModalVisible, setIsDeleteRowsModalVisible] =
    useState(false);

  const {
    data: publishedRowsCountMap,
    refetch: refetchPublishedRowsCountMap,
    isFetched: isPublishedRowsCountMapFetched,
  } = usePublishedRowsCountMapByType({
    dataModelExternalId,
    dataModelTypes: dataModelTypeDefs.types,
  });
  const deleteRowsMutation = useNodesDeleteMutation({
    dataModelExternalId,
    dataModelType,
  });

  const [listData, setListData] = useState<{
    fieldName: string;
    data: PrimitiveTypesListData;
  }>();

  const handleCloseListDataSidePanel = useCallback(() => {
    setListData(undefined);
  }, [setListData]);

  const handleRowPublish = (row: KeyValueMap) => {
    dataManagementHandler
      .ingestNodes(
        {
          spaceExternalId: dataModelExternalId,
          model: [dataModelExternalId, `${dataModelType.name}_${version}`],
          items: [sanitizeRow(row)],
        },
        dataModelExternalId,
        dataModelType,
        dataModelTypeDefs
      )
      .then(({ items }) => {
        removeDrafts(items.map((item) => item.externalId as string));
        refetchPublishedRowsCountMap().then(() => {
          gridRef.current?.api.refreshInfiniteCache();
        });
        Notification({
          type: 'success',
          message: t('ingest_success_title', 'Instance added'),
        });
      });
  };

  const isNoRowsOverlayVisible = useMemo(
    () =>
      draftRowsData.length === 0 &&
      (publishedRowsCountMap?.[dataModelType.name] || 0) === 0,
    [draftRowsData.length, publishedRowsCountMap, dataModelType]
  );

  useEffect(() => {
    setGridConfig(
      buildGridConfig(instanceIdCol, dataModelType, handleRowPublish)
    );
    setIsGridInit(false);
    setFetchError(null);

    // re-init grid config only and only when another type is clicked
    // eslint-disable-next-line
  }, [dataModelType.name]);

  useEffect(() => {
    if (!isGridInit) {
      setIsGridInit(true);
    }
  }, [isGridInit]);

  useEffect(() => {
    if (isNoRowsOverlayVisible && onShowNoRowsOverlay.current) {
      onShowNoRowsOverlay.current();
    } else if (onHideOverlay.current) {
      onHideOverlay.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNoRowsOverlayVisible]);

  useImperativeHandle(
    ref,
    () => {
      return {
        purgeInfiniteCache: () => {
          gridRef.current?.api.purgeInfiniteCache();
          console.log(
            'gridRef.current?.api.purgeInfiniteCache',
            gridRef.current?.api.purgeInfiniteCache
          );
        },
      };
    },
    [gridRef]
  );

  const onGridReady = useCallback(
    (grid: GridReadyEvent) => {
      let cursor: string;
      let hasNextPage: boolean;

      onShowNoRowsOverlay.current = () => grid.api.showNoRowsOverlay();
      onHideOverlay.current = () => grid.api.hideOverlay();

      const dataSource = {
        getRows: async (params: IGetRowsParams) => {
          /*
          startRow will be 0 if we're fetching the first block of data or if we've
          already fetched blocks of data but the ag-grid cache is being refreshed
          or purged. We need to ensure the pagination properties are reset when
          fetching the first block of data.
          */
          if (params.startRow === 0) {
            cursor = '';
            hasNextPage = false;
          }

          return dataManagementHandler
            .fetchData({
              dataModelId: dataModelExternalId,
              cursor,
              hasNextPage,
              dataModelType,
              dataModelTypeDefs,
              version,
              limit: pageSizeLimit,
            })
            .then((response) => {
              const result = response.getValue();
              hasNextPage = result.pageInfo.hasNextPage;
              cursor = result.pageInfo.cursor;

              const lastRow = !result.pageInfo.hasNextPage
                ? params.startRow + result.items.length
                : -1;

              /*
              This conditional is for the case where the aggregation
              is only returning 0s due to the syncer issue. Remove below code
              when the syncer issue is resolved.
              */
              if (result.items.length > 0 && onHideOverlay.current) {
                onHideOverlay.current();
              }

              params.successCallback(result.items, lastRow);
            })
            .catch((err) => {
              setFetchError(err);
            });
        },
      } as IDatasource;

      grid.api.setDatasource(dataSource);

      if (isNoRowsOverlayVisible) {
        onShowNoRowsOverlay.current();
      } else {
        onHideOverlay.current();
      }
    },
    [
      dataManagementHandler,
      dataModelExternalId,
      dataModelType,
      dataModelTypeDefs,
      isNoRowsOverlayVisible,
      onHideOverlay,
      onShowNoRowsOverlay,
      version,
    ]
  );
  const prevDraftRowsLength = useRef(draftRowsData.length);

  const handlePinnedRowDataChanged = (event: RowDataUpdatedEvent) => {
    if (draftRowsData.length > prevDraftRowsLength.current) {
      const firstEditableColName = event.api
        .getColumnDefs()
        ?.filter((col: ColDef) => col.editable)
        .map((col: ColDef) => col.field!)[0];
      if (firstEditableColName) {
        event.api.setFocusedCell(0, firstEditableColName, 'top');
        event.api.startEditingCell({
          rowPinned: 'top',
          rowIndex: 0,
          colKey: firstEditableColName,
        });
      }
    }
    prevDraftRowsLength.current = draftRowsData.length;
  };

  const handleCellEditingStarted = (e: CellEditingStartedEvent) => {
    const fieldName = e.colDef.field || '';
    const fieldType = dataModelType?.fields?.find(
      (field) => field.name === fieldName
    );
    const isListTypeCell = fieldType?.list || fieldType?.type.list;
    const isCustomListTypeCell =
      isListTypeCell && e.colDef.cellRendererParams.listDataType === 'CUSTOM';

    if (!isListTypeCell || isCustomListTypeCell) {
      handleCloseListDataSidePanel();
      return;
    }

    if (!e.colDef.field) {
      throw Error('Attempting to edit cell without field value');
    }

    const cellData = e.data[e.colDef.field] || [];

    setListData({
      data: cellData,
      fieldName: e.colDef.field,
    });
    e.api.stopEditing();
    window.setTimeout(() => {
      e.colDef.field && e.api.ensureColumnVisible(e.colDef.field);
    }, 400);
  };

  /*
  We use this value-setter to handle editing of pinned draft rows and published rows.
  The alternative of using readOnlyEdit and onCellEditRequest doesn't give us a good
  way to handle editing of a published row without seeing the old value for a split
  second before seeing the new value.

  Since ag-grid's value setter needs to return a boolean, we handle an async edit of a
  published row by first returning true, which in effect does an optimistic update, and
  then after our API call promise resolves, we simply update the react-query cache on
  success to ensure our cache has up-to-date data. On failure, we revert the grid cell's
  data and call refreshCells to ensure the cell rerenders.

  Technique borrowed from https://stackoverflow.com/a/64294316
  */
  const handleCellValueChanged = (e: ValueSetterParams) => {
    if (!e.colDef.field) {
      return false;
    }

    // if draft row, update redux store and return true
    if (e.node?.rowPinned === 'top') {
      updateRowData({
        field: e.colDef.field,
        newValue: e.newValue,
        row: e.data as DraftRowData,
      });
      return true;
    }

    let newValue = e.newValue;
    if (
      dataManagementHandler.isRelationshipField(
        e.colDef.field!,
        dataModelType,
        dataModelTypeDefs
      ) &&
      e.newValue !== null
    ) {
      // Set to null if externalId is set to empty string
      newValue = e.newValue === '' ? null : { externalId: e.newValue };
    }

    // update ag-grid cell data
    e.data[e.colDef.field] = newValue;

    const updatedRowData = {
      ...e.data,
    };

    dataManagementHandler
      .ingestNodes(
        {
          /*
        PG3 does not currently set a value to null if we pass null when doing a partial
        update (overwrite: false), but rather it will ignore that value. Therefore in
        order to be able to set values to null we need overwrite: true
        */
          overwrite: true,
          spaceExternalId: dataModelExternalId,
          model: [dataModelExternalId, `${dataModelType.name}_${version}`],
          items: [updatedRowData],
        },
        dataModelExternalId,
        dataModelType,
        dataModelTypeDefs
      )
      .then(() => {
        gridRef.current?.api.refreshCells();
        if (e.colDef.field) {
          e.api.refreshCells({ columns: [e.column], rowNodes: [e.node!] });
        }
      })
      .catch((error: PlatypusError) => {
        Notification({
          type: 'error',
          message: error.message,
        });

        if (e.colDef.field) {
          // revert data and rerender cell
          e.data[e.colDef.field] = e.oldValue;
          e.api.refreshCells({ columns: [e.column], rowNodes: [e.node!] });
        }
      });

    return true;
  };

  /*
  Listen to selection changed event and keep the count in state so that we rerender
  when necessary to enable/disable the delete button
  */
  const handleSelectionChanged = useCallback(() => {
    setSelectedPublishedRowsCount(
      gridRef.current?.api.getSelectedRows().length || 0
    );
  }, []);

  const handleDeleteRows = useCallback(() => {
    const selectedRows = gridRef.current?.api.getSelectedRows() || [];
    const dto = {
      spaceExternalId: dataModelExternalId,
      items: selectedRows.map((row) => ({ externalId: row.externalId })),
    };

    deleteRowsMutation.mutate(dto, {
      onSettled: (result, error) => {
        let isError = false;
        let errorMessage = '';

        if (error) {
          isError = true;
          errorMessage = error.message;
        }

        if (result?.isFailure) {
          isError = true;
          errorMessage = result.error.message;
        }

        if (isError) {
          Notification({
            type: 'error',
            message: errorMessage,
          });
          setIsDeleteRowsModalVisible(false);
          return;
        }

        gridRef.current?.api.refreshInfiniteCache();
        // We have to manually deselect rows
        // https://github.com/ag-grid/ag-grid/issues/4161
        gridRef.current?.api.deselectAll();

        // Delete draft rows
        deleteSelectedRows();

        let successNotificationMessage;

        if (singleSelectedRowExternalId) {
          successNotificationMessage = `${singleSelectedRowExternalId} ${t(
            'row-deletion-success-msg',
            'deleted'
          )}`;
        } else {
          successNotificationMessage = t(
            'row-deletion-success-msg',
            'Instances deleted'
          );
        }

        Notification({
          type: 'success',
          message: successNotificationMessage,
        });
        setIsDeleteRowsModalVisible(false);
        refetchPublishedRowsCountMap({ exact: true, cancelRefetch: true });
      },
    });
  }, [
    dataModelExternalId,
    deleteRowsMutation,
    deleteSelectedRows,
    singleSelectedRowExternalId,
    refetchPublishedRowsCountMap,
    t,
  ]);

  if (!isGridInit || !isPublishedRowsCountMapFetched) {
    return <Spinner />;
  }

  if (fetchError) {
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
      {totalSelectedRowCount > 0 && (
        <DeleteRowsModal
          isVisible={isDeleteRowsModalVisible}
          isDeleting={deleteRowsMutation.isLoading}
          singleRowExternalId={singleSelectedRowExternalId}
          onCancel={() => setIsDeleteRowsModalVisible(false)}
          onDelete={handleDeleteRows}
        />
      )}
      {isTransformationModalVisible && (
        <CreateTransformationModal
          dataModelExternalId={dataModelExternalId}
          dataModelType={dataModelType}
          onRequestClose={() => setIsTransformationModalVisible(false)}
          version={version}
        />
      )}

      <PreviewPageHeader
        title={dataModelType.name}
        isDeleteButtonDisabled={
          totalSelectedRowCount === 0 || deleteRowsMutation.isLoading
        }
        onAddTransformationClick={() => setIsTransformationModalVisible(true)}
        onCreateClick={createNewDraftRow}
        onDeleteClick={() => {
          setIsDeleteRowsModalVisible(true);
        }}
        draftRowsCount={draftRowsData.length}
        publishedRowsCount={publishedRowsCountMap?.[dataModelType.name] || 0}
        shouldShowDraftRows={shouldShowDraftRows}
        shouldShowPublishedRows={shouldShowPublishedRows}
        onDraftRowsCountClick={toggleShouldShowDraftRows}
        onPublishedRowsCountClick={toggleShouldShowPublishedRows}
        typeName={dataModelType.name}
        dataModelExternalId={dataModelExternalId}
        version={version}
      />

      <StyledCollapsablePanelContainer>
        <CollapsablePanel
          sidePanelRight={
            <SidePanel
              title={
                <Body
                  level={2}
                  style={{ color: 'var(--cogs-text-icon--medium)' }}
                >
                  <Title
                    as="span"
                    level={6}
                    style={{ color: 'var(--cogs-text-icon--medium)' }}
                  >
                    {`${listData?.fieldName} (${listData?.data.length})`}
                  </Title>
                  {` ${t('side_panel_title_for', 'for')} `}
                  <Title
                    as="span"
                    level={6}
                    style={{ color: 'var(--cogs-text-icon--medium)' }}
                  >
                    {dataModelType.name}
                  </Title>
                </Body>
              }
              onCloseClick={handleCloseListDataSidePanel}
            >
              {listData?.data && <CogDataList listData={listData.data || []} />}
            </SidePanel>
          }
          sidePanelRightVisible={!!listData}
          sidePanelRightWidth={376}
        >
          <StyledDataPreviewTable data-cy="data-preview-table">
            <CogDataGrid
              ref={gridRef}
              gridOptions={{
                enableCellChangeFlash: true,
                rowModelType: 'infinite',
                rowBuffer: pageSizeLimit / 2,
                // how big each page in our page cache will be, default is 100
                cacheBlockSize: pageSizeLimit,
                // this needs to be 1 since we use cursor-based pagination
                maxConcurrentDatasourceRequests: 1,
                noRowsOverlayComponent: () => (
                  <NoRowsOverlay
                    dataModelExternalId={dataModelExternalId}
                    onLoadDataClick={() =>
                      setIsTransformationModalVisible(true)
                    }
                    typeName={dataModelType.name}
                    version={version}
                  />
                ),
                onCellEditingStarted: handleCellEditingStarted,
              }}
              defaultColDef={{
                valueSetter: handleCellValueChanged,
              }}
              rowSelection="multiple"
              rowNodeId={instanceIdCol}
              config={gridConfig}
              suppressRowClickSelection
              rowMultiSelectWithClick={false}
              rowClassRules={{
                'ag-row-selected': (params) => params.data?._isDraftSelected,
              }}
              onGridReady={onGridReady}
              pinnedTopRowData={draftRowsData}
              onPinnedRowDataChanged={handlePinnedRowDataChanged}
              onSelectionChanged={handleSelectionChanged}
              shouldShowDraftRows={shouldShowDraftRows}
              shouldShowPublishedRows={shouldShowPublishedRows}
            />
          </StyledDataPreviewTable>
        </CollapsablePanel>
      </StyledCollapsablePanelContainer>
    </ErrorBoundary>
  );
});
