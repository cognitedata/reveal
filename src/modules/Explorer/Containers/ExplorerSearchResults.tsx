import React from 'react';
import { EnsureNonEmptyResource } from '@cognite/data-exploration';
import { FileFilterProps, FileInfo } from '@cognite/cdf-sdk-singleton';
import styled from 'styled-components';
import {
  ResultData,
  SelectFilter,
  TableDataItem,
  ViewMode,
} from 'src/modules/Common/types';
import { PageBasedGridView } from 'src/modules/Common/Components/GridView/PageBasedGridView';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  selectExplorerAllFilesSelected,
  selectExplorerSelectedIds,
  setReverse,
  setSortKey,
  ExploreSortPaginateType,
  setCurrentPage,
  setPageSize,
  setMapTableTabKey,
} from 'src/modules/Explorer/store/explorerSlice';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { setSelectedAllFiles } from 'src/store/commonActions';
import { ResultTableLoader } from './ResultTableLoader';
import { FileGridPreview } from '../../Common/Components/FileGridPreview/FileGridPreview';
import { MapView } from '../../Common/Components/MapView/MapView';
import { FileTableExplorer } from '../../Common/Components/FileTable/FileTableExplorer';

export const ExplorerSearchResults = ({
  selectedId,
  query = '',
  filter = {},
  onClick,
  currentView,
  onRowSelect,
}: {
  query?: string;
  selectedId?: number;
  filter?: FileFilterProps;
  onClick: (item: TableDataItem) => void;
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
  currentView: ViewMode;
}) => {
  const dispatch = useDispatch();
  const allFilesSelected = useSelector((state: RootState) =>
    selectExplorerAllFilesSelected(state.explorerReducer)
  );

  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedIds(state.explorerReducer)
  );
  const handleSelectAllFiles = (
    value: boolean,
    selectFilter?: SelectFilter
  ) => {
    dispatch(
      setSelectedAllFiles({ selectStatus: value, filter: selectFilter })
    );
  };

  const sortPaginateState = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.sortPaginate
  );

  const handleSetSortKey = (type: ExploreSortPaginateType, sortKey: string) => {
    dispatch(setSortKey({ type, sortKey }));
  };
  const handleSetReverse = (
    type: ExploreSortPaginateType,
    reverse: boolean
  ) => {
    dispatch(setReverse({ type, reverse }));
  };
  const handleSetCurrentPage = (
    type: ExploreSortPaginateType,
    currentPage: number
  ) => {
    dispatch(setCurrentPage({ type, currentPage }));
  };
  const handleSetPageSize = (
    type: ExploreSortPaginateType,
    pageSize: number
  ) => {
    dispatch(setPageSize({ type, pageSize }));
  };

  const getSortControls = (type: ExploreSortPaginateType) => ({
    sortKey: sortPaginateState[type].sortKey,
    reverse: sortPaginateState[type].reverse,
    setSortKey: (sortKey: string) => {
      handleSetSortKey(type, sortKey);
    },
    setReverse: (reverse: boolean) => {
      handleSetReverse(type, reverse);
    },
  });
  const getPaginationControls = (type: ExploreSortPaginateType) => ({
    currentPage: sortPaginateState[type].currentPage,
    pageSize: sortPaginateState[type].pageSize,
    setCurrentPage: (currentPage: number) => {
      handleSetCurrentPage(type, currentPage);
    },
    setPageSize: (pageSize: number) => {
      handleSetPageSize(type, pageSize);
    },
  });

  const listSortPaginateControls = {
    ...getSortControls(ExploreSortPaginateType.list),
    ...getPaginationControls(ExploreSortPaginateType.list),
  };
  const gridSortPaginateControls = {
    ...getPaginationControls(ExploreSortPaginateType.grid),
  };
  const sortPaginateControlsLocation = {
    ...getSortControls(ExploreSortPaginateType.mapLocation),
    ...getPaginationControls(ExploreSortPaginateType.mapLocation),
  };
  const sortPaginateControlsNoLocation = {
    ...getSortControls(ExploreSortPaginateType.mapNoLocation),
    ...getPaginationControls(ExploreSortPaginateType.mapNoLocation),
  };
  const modalSortPaginateControls = {
    ...getSortControls(ExploreSortPaginateType.modal),
    ...getPaginationControls(ExploreSortPaginateType.modal),
  };

  const activeKey = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.mapTableTabKey
  );
  const setActiveKey = (key: string) => {
    dispatch(setMapTableTabKey({ mapTableTabKey: key }));
  };

  return (
    <ResultContainer>
      <EnsureNonEmptyResource
        api="file"
        css={{ height: '100%', width: '100%' }}
      >
        <ResultTableLoader<FileInfo>
          css={{ height: '100%', width: '100%' }}
          type="file"
          filter={filter}
          query={query}
        >
          {(props: { data: ResultData[]; totalCount: number }) => {
            const renderView = () => {
              if (currentView === 'grid') {
                return (
                  <PageBasedGridView
                    selectedIds={selectedFileIds}
                    onItemClicked={onClick}
                    onSelect={onRowSelect}
                    {...props}
                    renderCell={(cellProps: any) => (
                      <FileGridPreview
                        mode={VisionMode.Explore}
                        actionDisabled={!!selectedFileIds.length}
                        {...cellProps}
                      />
                    )}
                    sortPaginateControls={gridSortPaginateControls}
                  />
                );
              }
              if (currentView === 'map') {
                return (
                  <MapView
                    onRowSelect={onRowSelect}
                    onRowClick={onClick}
                    selectedFileId={selectedId}
                    allRowsSelected={allFilesSelected}
                    onSelectAllRows={handleSelectAllFiles}
                    selectedRowIds={selectedFileIds}
                    {...props}
                    sortPaginateControlsLocation={sortPaginateControlsLocation}
                    sortPaginateControlsNoLocation={
                      sortPaginateControlsNoLocation
                    }
                    mapTableTabKey={{ activeKey, setActiveKey }}
                  />
                );
              }
              if (currentView === 'modal') {
                return (
                  <FileTableExplorer
                    modalView
                    onRowSelect={onRowSelect}
                    onRowClick={onClick}
                    selectedFileId={selectedId}
                    allRowsSelected={allFilesSelected}
                    onSelectAllRows={handleSelectAllFiles}
                    selectedRowIds={selectedFileIds}
                    {...props}
                    sortPaginateControls={modalSortPaginateControls}
                  />
                );
              }

              return (
                <FileTableExplorer
                  onRowSelect={onRowSelect}
                  onRowClick={onClick}
                  selectedFileId={selectedId}
                  allRowsSelected={allFilesSelected}
                  onSelectAllRows={handleSelectAllFiles}
                  selectedRowIds={selectedFileIds}
                  {...props}
                  sortPaginateControls={listSortPaginateControls}
                />
              );
            };
            return <>{renderView()}</>;
          }}
        </ResultTableLoader>
      </EnsureNonEmptyResource>
    </ResultContainer>
  );
};

const ResultContainer = styled.div`
  width: 100%;
  height: 100%;
`;
