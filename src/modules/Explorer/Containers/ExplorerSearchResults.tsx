import React from 'react';
import { EnsureNonEmptyResource } from '@cognite/data-exploration';
import { FileFilterProps, FileInfo } from '@cognite/cdf-sdk-singleton';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { FileTableExplorer } from 'src/modules/Common/Components/FileTable/FileTableExplorer';
import { MapView } from 'src/modules/Common/Components/MapView/MapView';
import { ResultTableLoader } from 'src/modules/Explorer/Containers/ResultTableLoader';
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
  setReverse,
  setSortKey,
  ExploreSortPaginateType,
  setCurrentPage,
  setPageSize,
  setMapTableTabKey,
  setExplorerSelectedFiles,
  setSelectedAllExplorerFiles,
} from 'src/modules/Explorer/store/explorerSlice';
import { VisionMode } from 'src/constants/enums/VisionEnums';

export const ExplorerSearchResults = ({
  currentView,
  query = '',
  filter = {},
  focusedId,
  selectedFileIds,
  isLoading = false,
  onClick,
  onRowSelect,
}: {
  currentView: ViewMode;
  query?: string;
  filter?: FileFilterProps;
  focusedId?: number;
  selectedFileIds: number[];
  isLoading?: boolean;
  onClick: (item: TableDataItem) => void;
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
}) => {
  const dispatch = useDispatch();

  const allFilesSelected = useSelector((state: RootState) =>
    selectExplorerAllFilesSelected(state.explorerReducer)
  );

  const activeKey = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.mapTableTabKey
  );

  const sortPaginateState = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.sortPaginate
  );

  const handleSelectAllFiles = (
    value: boolean,
    selectFilter?: SelectFilter
  ) => {
    dispatch(
      setSelectedAllExplorerFiles({ selectStatus: value, filter: selectFilter })
    );
  };
  const handleSetSelectedFiles = (fileIds: number[]) => {
    dispatch(setExplorerSelectedFiles(fileIds));
  };

  const setActiveKey = (key: string) => {
    dispatch(setMapTableTabKey({ mapTableTabKey: key }));
  };

  const getSortControls = (type: ExploreSortPaginateType) => ({
    sortKey: sortPaginateState[type].sortKey,
    reverse: sortPaginateState[type].reverse,
    setSortKey: (sortKey: string) => {
      dispatch(setSortKey({ type, sortKey }));
    },
    setReverse: (reverse: boolean) => {
      dispatch(setReverse({ type, reverse }));
    },
  });
  const getPaginationControls = (type: ExploreSortPaginateType) => ({
    currentPage: sortPaginateState[type].currentPage,
    pageSize: sortPaginateState[type].pageSize,
    setCurrentPage: (currentPage: number) => {
      dispatch(setCurrentPage({ type, currentPage }));
    },
    setPageSize: (pageSize: number) => {
      dispatch(setPageSize({ type, pageSize }));
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
                    isLoading={isLoading}
                  />
                );
              }
              if (currentView === 'map') {
                return (
                  <MapView
                    onRowSelect={onRowSelect}
                    onRowClick={onClick}
                    focusedFileId={focusedId}
                    allRowsSelected={allFilesSelected}
                    onSelectAllRows={handleSelectAllFiles}
                    selectedRowIds={selectedFileIds}
                    {...props}
                    sortPaginateControlsLocation={sortPaginateControlsLocation}
                    sortPaginateControlsNoLocation={
                      sortPaginateControlsNoLocation
                    }
                    mapTableTabKey={{ activeKey, setActiveKey }}
                    onSelectPage={handleSetSelectedFiles}
                    isLoading={isLoading}
                  />
                );
              }

              return (
                <FileTableExplorer
                  modalView={currentView === 'modal'}
                  onRowSelect={onRowSelect}
                  onRowClick={onClick}
                  focusedFileId={focusedId}
                  allRowsSelected={allFilesSelected}
                  onSelectAllRows={handleSelectAllFiles}
                  selectedRowIds={selectedFileIds}
                  {...props}
                  sortPaginateControls={
                    currentView === 'modal'
                      ? modalSortPaginateControls
                      : listSortPaginateControls
                  }
                  onSelectPage={handleSetSelectedFiles}
                  rowKey="rowKey"
                  isLoading={isLoading}
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
