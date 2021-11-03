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
  setCurrentPage,
  setPageSize,
  setMapTableTabKey,
  setExplorerSelectedFiles,
  setSelectedAllExplorerFiles,
} from 'src/modules/Explorer/store/explorerSlice';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { PaginationWrapper } from 'src/modules/Common/Components/SorterPaginationWrapper/PaginationWrapper';
import { PaginatedTableProps } from 'src/modules/Common/Components/FileTable/types';

export const ExplorerSearchResults = ({
  reFetchProp,
  currentView,
  query = '',
  filter = {},
  focusedId,
  selectedFileIds,
  isLoading = false,
  onClick,
  onRowSelect,
}: {
  reFetchProp?: boolean;
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
    ({ explorerReducer }: RootState) => explorerReducer.sortMeta
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

  const sortPaginateControls = {
    sortKey: sortPaginateState.sortKey,
    reverse: sortPaginateState.reverse,
    currentPage: sortPaginateState.currentPage,
    pageSize: sortPaginateState.pageSize,
    setSortKey: (sortKey: string) => {
      dispatch(setSortKey(sortKey));
    },
    setReverse: (reverse: boolean) => {
      dispatch(setReverse(reverse));
    },
    setCurrentPage: (currentPage: number) => {
      dispatch(setCurrentPage(currentPage));
    },
    setPageSize: (pageSize: number) => {
      dispatch(setPageSize(pageSize));
    },
  };

  const RenderView = (
    props: {
      data: ResultData[];
      totalCount: number;
    } & PaginatedTableProps<TableDataItem>
  ) => {
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
        onSelectPage={handleSetSelectedFiles}
        rowKey="rowKey"
        isLoading={isLoading}
      />
    );
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
          reFetchProp={reFetchProp}
        >
          {(props: { data: ResultData[]; totalCount: number }) => {
            return (
              <PaginationWrapper
                data={props.data}
                totalCount={props.totalCount}
                pagination
                sortPaginateControls={sortPaginateControls}
                isLoading={isLoading}
              >
                {(paginationProps) => (
                  <RenderView
                    {...paginationProps}
                    totalCount={props.totalCount}
                  />
                )}
              </PaginationWrapper>
            );
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
