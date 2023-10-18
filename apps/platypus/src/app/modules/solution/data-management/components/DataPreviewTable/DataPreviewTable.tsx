import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  BultinFieldTypeNames,
  DeleteInstancesDTO,
  KeyValueMap,
  MixerQueryBuilder,
  PlatypusError,
} from '@platypus/platypus-core';
import {
  CellDoubleClickedEvent,
  CellEditingStartedEvent,
  ColDef,
  ColumnResizedEvent,
  ColumnState,
  RowDataUpdatedEvent,
  ValueSetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import debounce from 'lodash/debounce';

import { CogDataGrid, GridConfig } from '@cognite/cog-data-grid';
import { Button } from '@cognite/cogs.js';

import { ErrorBoundary } from '../../../../../components/ErrorBoundary/ErrorBoundary';
import { Notification } from '../../../../../components/Notification/Notification';
import { Spinner } from '../../../../../components/Spinner/Spinner';
import { useDMContext } from '../../../../../context/DMContext';
import { TOKENS } from '../../../../../di';
import {
  useManualPopulationFeatureFlag,
  useDataManagementDeletionFeatureFlag,
  useSuggestionsFeatureFlag,
  useFilterBuilderFeatureFlag,
  useColumnSelectionFeatureFlag,
} from '../../../../../flags';
import { useInjection } from '../../../../../hooks/useInjection';
import { useMixpanel } from '../../../../../hooks/useMixpanel';
import useSelector from '../../../../../hooks/useSelector';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { DraftRowData } from '../../../../../redux/reducers/global/dataManagementReducer';
import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';
import { useDraftRows } from '../../hooks/useDraftRows';
import { useGetFilteredRowsCount } from '../../hooks/useGetFilteredRowsCount';
import { useListDataSource } from '../../hooks/useListDataSource';
import { useNodesDeleteMutation } from '../../hooks/useNodesDeleteMutation';
import { usePublishedRowsCountMapByType } from '../../hooks/usePublishedRowsCountMapByType';
import { usePublishRowMutation } from '../../hooks/usePublishRowMutation';
import { buildGridConfig } from '../../services/grid-config-builder';
import { ColumnToggleType, ColumnToggle } from '../ColumnToggle/ColumnToggle';
import { CreateTransformationModal } from '../CreateTransformationModal';
import { DeleteRowsModal } from '../DeleteRowsModal/DeleteRowsModal';
import { FilterBuilder } from '../FilterBuilder/FilterBuilder';
import { PreviewPageHeader } from '../PreviewPageHeader/PreviewPageHeader';
import { SuggestionsModal } from '../SuggestionsModal/SuggestionsModal';

import {
  CollapsiblePanelContainer,
  CustomDataTypes,
  DataPreviewSidebarData,
} from './collapsible-panel-container';
import { StyledDataPreviewTable } from './elements';
import { ErrorPlaceholder } from './ErrorPlaceholder';
import { NoRowsOverlay } from './NoRowsOverlay';
import {
  getColumnsInitialOrder,
  getSuggestionsAvailable,
  sanitizeRow,
} from './utils';

const pageSizeLimit = 100;
const instanceIdCol = 'externalId';
const lockedFields = ['lastUpdatedTime', 'createdTime'];

export type DataPreviewTableRef = {
  purgeInfiniteCache: () => void;
};

export const DataPreviewTable = () => {
  const {
    selectedDataModel: { version, externalId: dataModelExternalId, space },
    selectedDataType,
    typeDefs: dataModelTypeDefs,
    versions: dataModelVersions,
  } = useDMContext();
  const dataModelType = selectedDataType!;
  const { t } = useTranslation('DataPreviewTable');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<any>(null);
  const [isTransformationModalVisible, setIsTransformationModalVisible] =
    useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  // This property is used to trigger a rerender when a selection occurs in the grid
  const [, setSelectedPublishedRowsCount] = useState(0);
  const [filteredRowsCount, setFilteredRowsCount] = useState<null | number>(
    null
  );
  const countResult = useGetFilteredRowsCount();
  const [columnState, setColumnState] = useState<ColumnState[]>([]);
  const [shouldAlignColumnState, setShouldAlignColumnState] = useState(false);
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

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const deleteInstancesCommand = useInjection(TOKENS.deleteInstancesCommand);
  const queryBuilder = new MixerQueryBuilder();

  const draftRowsData = useSelector(
    (state) => state.dataManagement.draftRows[dataModelType!.name] || []
  );

  const { shouldShowDraftRows, shouldShowPublishedRows } = useSelector(
    (state) => ({
      shouldShowDraftRows: state.dataManagement.shouldShowDraftRows,
      shouldShowPublishedRows: state.dataManagement.shouldShowPublishedRows,
    })
  );

  const { updateRowData, removeDrafts, createNewDraftRow, deleteSelectedRows } =
    useDraftRows();

  useEffect(() => {
    if (countResult !== filteredRowsCount) {
      setFilteredRowsCount(countResult || null);
    }
  }, [countResult, filteredRowsCount]);

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

  const [isSuggestionsModalVisible, setIsSuggestionsModalVisible] =
    useState(false);

  const {
    data: publishedRowsCountMap,
    refetch: refetchPublishedRowsCountMap,
    isFetched: isPublishedRowsCountMapFetched,
  } = usePublishedRowsCountMapByType();
  const deleteRowsMutation = useNodesDeleteMutation();
  const { mutateAsync: addRowsMutation } = usePublishRowMutation();
  const viewVersion = dataModelType.version;

  const [sidebarData, setSidebarData] = useState<DataPreviewSidebarData>();

  const handleRowPublish = useCallback(
    (row: KeyValueMap) => {
      if (!viewVersion) {
        Notification({
          type: 'error',
          message: t(
            'ingest_failed_title',
            `Unable to create ${dataModelType.name}`
          ),
        });
        return;
      }
      addRowsMutation({
        instanceSpace: row.space || space,
        space,
        model: [dataModelExternalId, `${dataModelType.name}_${viewVersion}`],
        version: viewVersion,
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
    },
    [
      addRowsMutation,
      dataModelExternalId,
      dataModelType,
      dataModelTypeDefs,
      refetchPublishedRowsCountMap,
      removeDrafts,
      space,
      t,
      track,
      viewVersion,
    ]
  );

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
      true,
      dataModelVersions
    )
  );

  useEffect(() => {
    setGridConfig(
      buildGridConfig(
        instanceIdCol,
        dataModelType,
        handleRowPublish,
        isDeletionEnabled,
        isManualPopulationEnabled,
        columnOrder.filter((el) => el.visible).map((el) => el.value),
        true,
        dataModelVersions
      )
    );
  }, [
    columnOrder,
    dataModelType,
    dataModelVersions,
    handleRowPublish,
    isDeletionEnabled,
    isManualPopulationEnabled,
  ]);

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

  const onError = useCallback((error: any) => {
    Notification({
      type: 'error',
      message: error.message,
      errors: JSON.stringify(error.errors),
    });
  }, []);

  const onSuccess = useCallback(
    (items: any[]) => {
      /*
      This conditional is for the case where the aggregation
      is only returning 0s due to the syncer issue. Remove below code
      when the syncer issue is resolved.
      */
      if (items.length > 0 && onHideOverlay.current) {
        onHideOverlay.current();
      }

      setShouldAlignColumnState(true);

      setSuggestionsAvailable(
        getSuggestionsAvailable({
          dataModelType,
          previewData: items,
        })
      );
    },
    [dataModelType, onHideOverlay]
  );

  const listDataSource = useListDataSource({
    limit: pageSizeLimit,
    onError,
    onSuccess,
  });

  const setDataSource = useCallback(
    (grid?: Pick<AgGridReact, 'api'> | null) => {
      if (grid) {
        onShowNoRowsOverlay.current = () => grid.api.showNoRowsOverlay();
        onHideOverlay.current = () => grid.api.hideOverlay();
        grid.api.setDatasource(listDataSource);

        if (isNoRowsOverlayVisible) {
          onShowNoRowsOverlay.current();
        } else {
          onHideOverlay.current();
        }
      }
    },
    [listDataSource, isNoRowsOverlayVisible, onHideOverlay, onShowNoRowsOverlay]
  );

  useEffect(() => {
    setDataSource(gridRef.current);
  }, [setDataSource, gridRef]);

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

      const doesDataRequireSidebar =
        (fieldType.type.list && currValue.length > 0) ||
        ['JSONObject', ...CustomDataTypes].includes(fieldType.type.name) ||
        fieldType.type.custom;

      // if there's no data, an empty list, or the data is not a type we display in the sidebar
      // we do not render a sidebar.
      if (
        !currValue ||
        !doesDataRequireSidebar ||
        (fieldType.type.list && currValue.length === 0)
      ) {
        setSidebarData(undefined);
        return;
      }

      const newSidebarData: DataPreviewSidebarData = {
        fieldName: field,
        instanceExternalId: externalId,
        instanceSpace,
        isList: Boolean(fieldType.type.list),
        json: fieldType.type.name === 'JSONObject' ? currValue : undefined,
        listValues: currValue,
        type: fieldType.type.custom
          ? 'custom'
          : (fieldType.type.name as BultinFieldTypeNames),
      };

      if (fieldType.type.custom) {
        const targetFieldType = dataModelTypeDefs.types.find(
          (type) => type.name === fieldType.type.name
        );

        if (targetFieldType) {
          newSidebarData.fieldType = targetFieldType;
        }
      }

      setSidebarData(newSidebarData);
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
        event.value?.space || event.data?.space || space,
        event.value
      );
      // 400ms is animation time of side panel opening
      window.setTimeout(() => {
        event.colDef.field && event.api.ensureColumnVisible(event.colDef.field);
      }, 400);
    },
    [toggleSidebar, space]
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
    if (!viewVersion) {
      Notification({
        type: 'error',
        message: t(
          'update_failed_title',
          `Unable to update ${dataModelType.name}`
        ),
      });
      return false;
    }
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
        instanceSpace: updatedRowData.space || space,
        model: [dataModelExternalId, `${dataModelType.name}_${viewVersion}`],
        items: [updatedRowData],
        version: viewVersion,
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

    if (updatedRowData.space !== e.oldValue) {
      deleteInstancesCommand.execute({
        /*
            PG3 does not currently set a value to null if we pass null when doing a partial
            update (overwrite: false), but rather it will ignore that value. Therefore in
            order to be able to set values to null we need overwrite: true
            */
        space: e.oldValue,
        items: [updatedRowData],
        dataModelExternalId,
        type: 'node',
      });
    }

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
      items: selectedRows.map((row) => ({
        externalId: row.externalId,
        space: row.space,
      })),
    };

    deleteRowsMutation.mutate(dto, {
      onSuccess: () => {
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
      onError: (error) => {
        // in some cases, we are returning just a string instead of an object
        const errorMessage = error.message || error;

        track('ManualPopulation.Delete', { success: false });
        Notification({
          type: 'error',
          message: errorMessage as string,
        });
        setIsDeleteRowsModalVisible(false);
        return;
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

  useEffect(() => {
    gridRef.current?.columnApi.applyColumnState({
      state: columnState,
    });
    if (shouldAlignColumnState) {
      setShouldAlignColumnState(false);
    }
  }, [columnState, shouldAlignColumnState]);

  const handleColumnResized = (event: ColumnResizedEvent) => {
    if (event.finished && event.source === 'uiColumnDragged') {
      const newColumnState = event.columnApi.getColumnState();
      setColumnState(newColumnState);
    }
  };

  if (!isPublishedRowsCountMapFetched) {
    return <Spinner />;
  }

  return (
    <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
      {totalSelectedRowCount > 0 && (
        <DeleteRowsModal
          isVisible={isDeleteRowsModalVisible}
          isDeleting={deleteRowsMutation.isLoading}
          selectedRowsExternalIds={(selectedDraftRows || [])
            .map((el) => el.externalId)
            .concat(
              (gridRef.current?.api.getSelectedRows() || []).map(
                (el) => el.externalId
              )
            )}
          onCancel={() => setIsDeleteRowsModalVisible(false)}
          onDelete={handleDeleteRows}
        />
      )}
      {dataModelType.version && isTransformationModalVisible && (
        <CreateTransformationModal
          onRequestClose={() => setIsTransformationModalVisible(false)}
        />
      )}
      {isSuggestionsModalVisible && isSuggestionsEnabled && (
        <SuggestionsModal
          defaultColumn={suggestionsColumn}
          onCancel={handleSuggestionsClose}
          onConfirm={handleSuggestionsClose}
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
                    (sortColumn.sort!.toUpperCase() as 'ASC' | 'DESC') || 'ASC',
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
        filteredRowsCount={filteredRowsCount}
        shouldShowDraftRows={shouldShowDraftRows}
        shouldShowPublishedRows={shouldShowPublishedRows}
        onRefreshClick={() => gridRef.current?.api.purgeInfiniteCache()}
        title={dataModelType.name}
        onSuggestionsClick={() => {
          track('Suggestions.Open');
          setIsSuggestionsModalVisible(true);
        }}
        suggestionsAvailable={suggestionsAvailable}
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
              }}
            />
          )}
        </>
      </PreviewPageHeader>
      <CollapsiblePanelContainer
        data={sidebarData}
        onClose={() => setSidebarData(undefined)}
      >
        <StyledDataPreviewTable
          data-cy="data-preview-table"
          id="dataPreviewTableWrapper"
        >
          <CogDataGrid
            ref={gridRef}
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
              enableCellExpressions: false,
              rowBuffer: pageSizeLimit / 2,
              // how big each page in our page cache will be, default is 100
              cacheBlockSize: pageSizeLimit,
              // this needs to be 1 since we use cursor-based pagination
              maxConcurrentDatasourceRequests: 1,
              noRowsOverlayComponent: () => (
                <NoRowsOverlay
                  space={space}
                  onLoadDataClick={() => setIsTransformationModalVisible(true)}
                  typeName={dataModelType.name}
                  viewVersion={dataModelType.version}
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
            onColumnResized={handleColumnResized}
            onGridReady={setDataSource}
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
};
