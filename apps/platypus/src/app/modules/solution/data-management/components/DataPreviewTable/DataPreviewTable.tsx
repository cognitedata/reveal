import { CogDataGrid, GridConfig } from '@cognite/cog-data-grid';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DraftRowData } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DeleteInstancesDTO,
  KeyValueMap,
  MixerQueryBuilder,
  PlatypusError,
} from '@platypus/platypus-core';
import {
  CellDoubleClickedEvent,
  CellEditingStartedEvent,
  ColDef,
  GridReadyEvent,
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
import { buildGridConfig } from '../../services/grid-config-builder';
import { CreateTransformationModal } from '../CreateTransformationModal';
import { DeleteRowsModal } from '../DeleteRowsModal/DeleteRowsModal';
import { PreviewPageHeader } from '../PreviewPageHeader/PreviewPageHeader';
import { SuggestionsModal } from '../SuggestionsModal/SuggestionsModal';

import { StyledDataPreviewTable } from './elements';
import { ErrorPlaceholder } from './ErrorPlaceholder';
import { NoRowsOverlay } from './NoRowsOverlay';
import {
  getColumnsInitialOrder,
  getSuggestionsAvailable,
  sanitizeRow,
} from './utils';
import {
  useManualPopulationFeatureFlag,
  useDataManagementDeletionFeatureFlag,
  useSuggestionsFeatureFlag,
  useFilterBuilderFeatureFlag,
  useColumnSelectionFeatureFlag,
} from '@platypus-app/flags';
import {
  CollapsiblePanelContainer,
  DataPreviewSidebarData,
} from './collapsible-panel-container';
import debounce from 'lodash/debounce';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { useListDataSource } from '../../hooks/useListDataSource';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { ColumnToggleType, ColumnToggle } from '../ColumnToggle/ColumnToggle';
import { FilterBuilder } from '../FilterBuilder/FilterBuilder';
import { Button } from '@cognite/cogs.js';

const pageSizeLimit = 100;
const instanceIdCol = 'externalId';
const lockedFields = ['space', 'lastUpdatedTime', 'createdTime'];

export interface DataPreviewTableProps {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  dataModelExternalId: string;
  version: string;
  space: string;
}

export type DataPreviewTableRef = {
  purgeInfiniteCache: () => void;
};

export const DataPreviewTable = forwardRef<
  DataPreviewTableRef,
  DataPreviewTableProps
>(
  (
    { dataModelType, dataModelTypeDefs, dataModelExternalId, version, space },
    ref
  ) => {
    const { t } = useTranslation('DataPreviewTable');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<any>(null);
    const [isTransformationModalVisible, setIsTransformationModalVisible] =
      useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    // This property is used to trigger a rerender when a selection occurs in the grid
    const [, setSelectedPublishedRowsCount] = useState(0);
    const [filteredRowCount, setFilteredRowCount] = useState<null | number>(
      null
    );
    const gridRef = useRef<AgGridReact>(null);
    const { track } = useMixpanel();
    const { isEnabled: isManualPopulationEnabled } =
      useManualPopulationFeatureFlag();
    const { isEnabled: isSuggestionsEnabled } = useSuggestionsFeatureFlag();
    const { isEnabled: isFilterBuilderEnabled } = useFilterBuilderFeatureFlag();
    const { isEnabled: isDeletionEnabled } =
      useDataManagementDeletionFeatureFlag();
    const { isEnabled: isColumnSelectionEnabled } =
      useColumnSelectionFeatureFlag();
    const { dataModelVersion: selectedDataModelVersion } =
      useSelectedDataModelVersion(version, dataModelExternalId, space);

    const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
    const queryBuilder = new MixerQueryBuilder();

    const draftRowsData = useSelector(
      (state) => state.dataManagement.draftRows[dataModelType.name] || []
    );

    const { shouldShowDraftRows, shouldShowPublishedRows } = useSelector(
      (state) => ({
        shouldShowDraftRows: state.dataManagement.shouldShowDraftRows,
        shouldShowPublishedRows: state.dataManagement.shouldShowPublishedRows,
      })
    );

    const {
      updateRowData,
      removeDrafts,
      createNewDraftRow,
      deleteSelectedRows,
    } = useDraftRows();

    const [columnOrder, setColumnOrder] = useState<ColumnToggleType[]>(
      getColumnsInitialOrder(dataModelType, instanceIdCol)
    );

    const [suggestionsAvailable, setSuggestionsAvailable] = useState(false);
    const [suggestionsColumn, setSuggestionsColumn] = useState<
      string | undefined
    >(undefined);

    const {
      toggleShouldShowDraftRows,
      toggleShouldShowPublishedRows,
      onShowNoRowsOverlay,
      onHideOverlay,
    } = useDataManagementPageUI();
    const selectedDraftRows = draftRowsData.filter(
      (row) => row._isDraftSelected
    );
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

    const [isSuggestionsModalVisible, setIsSuggestionsModalVisible] =
      useState(false);

    const {
      data: publishedRowsCountMap,
      refetch: refetchPublishedRowsCountMap,
      isFetched: isPublishedRowsCountMapFetched,
    } = usePublishedRowsCountMapByType({
      dataModelExternalId,
      dataModelTypes: dataModelTypeDefs.types,
      space,
    });
    const deleteRowsMutation = useNodesDeleteMutation({
      dataModelExternalId,
      dataModelType,
      space,
    });

    const [sidebarData, setSidebarData] = useState<DataPreviewSidebarData>();

    const handleRowPublish = (row: KeyValueMap) => {
      dataManagementHandler
        .ingestNodes({
          space,
          model: [dataModelExternalId, `${dataModelType.name}_${version}`],
          version,
          items: [sanitizeRow(row) as { externalId: string }],
          dataModelExternalId,
          dataModelType,
          dataModelTypeDefs,
        })
        .then(({ items }) => {
          track('ManualPopulation.Create', { success: true });
          removeDrafts(items.map((item) => item.externalId as string));
          refetchPublishedRowsCountMap().then(() => {
            gridRef.current?.api.refreshInfiniteCache();
          });
          Notification({
            type: 'success',
            message: t('ingest_success_title', 'Instance added'),
          });
        })
        .catch((e) => {
          track('ManualPopulation.Create', { success: false });
          throw e;
        });
    };

    useEffect(() => {
      track('DataModel.Data.View', { version, type: dataModelType.name });
    }, [track, dataModelType, version]);

    useEffect(() => {
      setColumnOrder(getColumnsInitialOrder(dataModelType, instanceIdCol));
    }, [dataModelType]);

    const handleSuggestionsClose = async (selectedColumn?: string) => {
      gridRef.current?.api.refreshInfiniteCache();
      setIsSuggestionsModalVisible(false);
      setSuggestionsColumn(selectedColumn);
    };

    // set gridConfig in state so the reference is stable and doesn't cause rerenders
    const [gridConfig, setGridConfig] = useState<GridConfig>(
      buildGridConfig(
        instanceIdCol,
        dataModelType,
        handleRowPublish,
        isDeletionEnabled,
        isManualPopulationEnabled,
        columnOrder.filter((el) => el.visible).map((el) => el.value),
        !isFilterBuilderEnabled
      )
    );

    const isNoRowsOverlayVisible = useMemo(
      () =>
        draftRowsData.length === 0 &&
        (publishedRowsCountMap?.[dataModelType.name] || 0) === 0,
      [draftRowsData.length, publishedRowsCountMap, dataModelType]
    );

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
          },
        };
      },
      [gridRef]
    );

    const listDataSource = useListDataSource({
      dataModelType,
      dataModelTypeDefs,
      dataModelVersion: selectedDataModelVersion,
      limit: pageSizeLimit,
      onError: (error) => {
        Notification({
          type: 'error',
          message: error.message,
          errors: JSON.stringify(error.errors),
        });
      },
      onSuccess: (items) => {
        /*
        This conditional is for the case where the aggregation
        is only returning 0s due to the syncer issue. Remove below code
        when the syncer issue is resolved.
        */
        if (items.length > 0 && onHideOverlay.current) {
          onHideOverlay.current();
        }
        setSuggestionsAvailable(
          getSuggestionsAvailable({
            dataModelType,
            previewData: items,
          })
        );
      },
    });

    const onGridReady = useCallback(
      (grid: GridReadyEvent) => {
        onShowNoRowsOverlay.current = () => grid.api.showNoRowsOverlay();
        onHideOverlay.current = () => grid.api.hideOverlay();
        grid.api.setDatasource(listDataSource);

        if (isNoRowsOverlayVisible) {
          onShowNoRowsOverlay.current();
        } else {
          onHideOverlay.current();
        }
      },
      [
        listDataSource,
        isNoRowsOverlayVisible,
        onHideOverlay,
        onShowNoRowsOverlay,
      ]
    );

    const prevDraftRowsLength = useRef(draftRowsData.length);

    useEffect(() => {
      gridRef.current?.api.onFilterChanged();
      track('DataModel.Data.Search', { version, type: dataModelType.name });
    }, [searchTerm, track, dataModelType.name, version]);

    useEffect(() => {
      gridRef.current?.api.onFilterChanged();
      track('DataModel.Data.Filter', {
        version,
        type: dataModelType.name,
        builder: true,
      });
    }, [filter, track, dataModelType.name, version]);

    const debouncedHandleSearchInputValueChange = debounce((value) => {
      setSearchTerm(value);
    }, 300);

    useEffect(() => {
      return () => {
        debouncedHandleSearchInputValueChange.cancel();
      };
    }, [debouncedHandleSearchInputValueChange]);

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

      if (!e.colDef.field) {
        throw Error('Attempting to edit cell without field value');
      }

      if (isListTypeCell) {
        e.api.stopEditing();
      }
    };

    const toggleSidebar = useCallback(
      (
        field: string,
        externalId: string,
        instanceSpace: string,
        currValue?: any
      ) => {
        const fieldType = dataModelType.fields.find(
          (item) => item.name === field
        );

        // externalID for example is not in the dataModelType.fields
        if (!fieldType) {
          return;
        }

        if ((fieldType.type.list && currValue.length === 0) || !currValue) {
          setSidebarData(undefined);
          return;
        }

        if (fieldType.type.list) {
          setSidebarData({
            externalId,
            fieldName: field,
            instanceSpace,
            type: 'list',
          });
        } else if (fieldType.type.name === 'JSONObject') {
          setSidebarData({
            fieldName: field,
            json: currValue,
            type: 'json',
          });
        } else if (fieldType.type.custom) {
          const targetFieldType = dataModelTypeDefs.types.find(
            (type) => type.name === fieldType.type.name
          );
          if (targetFieldType) {
            setSidebarData({
              externalId: currValue.externalId,
              fieldName: field,
              fieldType: targetFieldType,
              instanceSpace,
              type: 'custom',
            });
          }
        } else {
          setSidebarData(undefined);
        }
      },
      [dataModelType, dataModelTypeDefs.types]
    );

    const handleCellDoubleClicked = useCallback(
      (event: CellDoubleClickedEvent) => {
        if (!event.colDef.field) {
          return;
        }
        toggleSidebar(
          event.colDef.field,
          event.data.externalId,
          /*
          If the cell is a direct relation, use the space from the cell value,
          else use the space from the instance in this row
          */
          event.value.space || event.data.space,
          event.value
        );
        // 400ms is animation time of side panel opening
        window.setTimeout(() => {
          event.colDef.field &&
            event.api.ensureColumnVisible(event.colDef.field);
        }, 400);
      },
      [toggleSidebar]
    );
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
      if (!e.colDef.field || !isManualPopulationEnabled) {
        return false;
      }

      const newValue = e.newValue;

      if (e.node?.rowPinned === 'top') {
        // if draft row, update redux store and return true
        updateRowData({
          field: e.colDef.field,
          newValue: newValue,
          row: e.data as DraftRowData,
        });
        return true;
      }

      // update ag-grid cell data
      e.data[e.colDef.field] = newValue;

      const updatedRowData = {
        ...e.data,
      };

      for (const key of lockedFields) {
        delete updatedRowData[key];
      }

      dataManagementHandler
        .ingestNodes({
          /*
        PG3 does not currently set a value to null if we pass null when doing a partial
        update (overwrite: false), but rather it will ignore that value. Therefore in
        order to be able to set values to null we need overwrite: true
        */
          overwrite: true,
          space,
          model: [dataModelExternalId, `${dataModelType.name}_${version}`],
          items: [updatedRowData],
          version,
          dataModelExternalId,
          dataModelType,
          dataModelTypeDefs,
        })
        .then(() => {
          track('ManualPopulation.Update', { success: true });
          gridRef.current?.api.refreshCells();
          if (e.colDef.field) {
            e.api.refreshCells({ columns: [e.column], rowNodes: [e.node!] });
            toggleSidebar(
              e.colDef.field,
              e.data.externalId,
              e.data.space,
              newValue
            );
          }
          const data: KeyValueMap[] = [];
          gridRef.current?.api.forEachNode((el) => data.push(el.data));
          setSuggestionsAvailable(
            getSuggestionsAvailable({
              dataModelType,
              previewData: data,
            })
          );
        })
        .catch((error: PlatypusError) => {
          track('ManualPopulation.Update', { success: false });
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
      const dto: DeleteInstancesDTO = {
        type: 'node',
        dataModelExternalId,
        space,
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
            track('ManualPopulation.Delete', { success: false });
            Notification({
              type: 'error',
              message: errorMessage,
            });
            setIsDeleteRowsModalVisible(false);
            return;
          }
          track('ManualPopulation.Delete', { success: true });

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
      space,
      track,
    ]);

    if (!isPublishedRowsCountMapFetched) {
      return <Spinner />;
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
            space={space}
            version={version}
          />
        )}
        {isSuggestionsModalVisible && isSuggestionsEnabled && (
          <SuggestionsModal
            defaultColumn={suggestionsColumn}
            onCancel={handleSuggestionsClose}
            onConfirm={handleSuggestionsClose}
            dataModelInfo={{
              dataModelType,
              dataModelTypeDefs,
              dataModelExternalId,
              version,
              space,
            }}
          />
        )}
        <FilterBuilder
          initialFilter={filter}
          visible={isFilterModalVisible}
          onOk={(newFilter) => {
            track('FilterBuilder.Apply', { filter });
            setFilter(newFilter);
            setFilterModalVisible(false);
          }}
          onCancel={() => setFilterModalVisible(false)}
          dataModelType={dataModelType}
          dataModelExternalId={dataModelExternalId}
          version={version}
          space={space}
          copyButtonCallback={() => {
            track('FilterBuilder.Copy');
            const sortColumn = gridRef.current?.columnApi
              .getColumnState()
              .filter((el) => el.sort)[0];
            const query = queryBuilder.buildListQuery({
              cursor: '',
              dataModelType,
              dataModelTypeDefs,
              limit: pageSizeLimit,
              sort: sortColumn
                ? {
                    fieldName: sortColumn.colId,
                    sortType:
                      (sortColumn.sort!.toUpperCase() as 'ASC' | 'DESC') ||
                      'ASC',
                  }
                : undefined,
              nestedLimit: 2,
              filter,
            });
            navigator.clipboard.writeText(
              JSON.stringify(
                { query: query, variables: { $filter: filter } },
                null,
                2
              )
            );
            Notification({
              type: 'success',
              message: 'Copied code to clipboard 🚀',
            });
          }}
        />

        <PreviewPageHeader
          space={space}
          draftRowsCount={draftRowsData.length}
          isDeleteButtonDisabled={
            totalSelectedRowCount === 0 || deleteRowsMutation.isLoading
          }
          onAddTransformationClick={() => setIsTransformationModalVisible(true)}
          onCreateClick={createNewDraftRow}
          onDeleteClick={() => {
            setIsDeleteRowsModalVisible(true);
          }}
          onDraftRowsCountClick={toggleShouldShowDraftRows}
          onPublishedRowsCountClick={toggleShouldShowPublishedRows}
          onSearchInputValueChange={debouncedHandleSearchInputValueChange}
          publishedRowsCount={publishedRowsCountMap?.[dataModelType.name] || 0}
          filteredRowCount={filteredRowCount}
          shouldShowDraftRows={shouldShowDraftRows}
          shouldShowPublishedRows={shouldShowPublishedRows}
          title={dataModelType.name}
          onSuggestionsClick={() => {
            track('Suggestions.Open');
            setIsSuggestionsModalVisible(true);
          }}
          suggestionsAvailable={suggestionsAvailable}
          typeName={dataModelType.name}
          version={version}
        >
          <>
            {isFilterBuilderEnabled && (
              <Button
                icon="Filter"
                onClick={() => {
                  setFilterModalVisible(true);
                  track('FilterBuilder.Open');
                }}
              >
                Filters
              </Button>
            )}
            {isColumnSelectionEnabled && (
              <ColumnToggle
                allColumns={columnOrder}
                onChange={(order) => {
                  setColumnOrder(order);
                  setGridConfig(
                    buildGridConfig(
                      instanceIdCol,
                      dataModelType,
                      handleRowPublish,
                      isDeletionEnabled,
                      isManualPopulationEnabled,
                      order.filter((el) => el.visible).map((el) => el.value),
                      isFilterBuilderEnabled
                    )
                  );
                }}
              />
            )}
          </>
        </PreviewPageHeader>
        <CollapsiblePanelContainer
          data={sidebarData}
          onClose={() => setSidebarData(undefined)}
          dataModelType={dataModelType}
          dataModelTypeDefs={dataModelTypeDefs}
          dataModelVersion={selectedDataModelVersion}
        >
          <StyledDataPreviewTable
            data-cy="data-preview-table"
            id="dataPreviewTableWrapper"
          >
            <CogDataGrid
              ref={gridRef}
              onModelUpdated={(event) => {
                setFilteredRowCount(event.api.getDisplayedRowCount());
              }}
              onSortChanged={() => {
                track('DataModel.Data.Sort', {
                  version,
                  type: dataModelType.name,
                });
              }}
              onFilterChanged={() => {
                track('DataModel.Data.Filter', {
                  version,
                  type: dataModelType.name,
                });
              }}
              gridOptions={{
                alwaysMultiSort: false,
                readOnlyEdit: !isManualPopulationEnabled,
                enableCellChangeFlash: true,
                enableCellTextSelection: true,
                rowModelType: 'infinite',
                rowBuffer: pageSizeLimit / 2,
                // how big each page in our page cache will be, default is 100
                cacheBlockSize: pageSizeLimit,
                // this needs to be 1 since we use cursor-based pagination
                maxConcurrentDatasourceRequests: 1,
                noRowsOverlayComponent: () => (
                  <NoRowsOverlay
                    space={space}
                    onLoadDataClick={() =>
                      setIsTransformationModalVisible(true)
                    }
                    typeName={dataModelType.name}
                    version={version}
                  />
                ),
                context: {
                  dataModelExternalId,
                  dataModelType,
                  dataModelTypeDefs,
                  searchTerm,
                  filter,
                  space,
                  // passing the useTranslate method in case any class components need it,
                  // such as custom-column-filter
                  t,
                  version,
                },
                onCellEditingStarted: handleCellEditingStarted,
                onCellDoubleClicked: handleCellDoubleClicked,
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
        </CollapsiblePanelContainer>
      </ErrorBoundary>
    );
  }
);
