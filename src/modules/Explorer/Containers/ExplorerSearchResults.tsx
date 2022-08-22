import React, { useCallback, useEffect, useMemo } from 'react';
import { EnsureNonEmptyResource } from '@cognite/data-exploration';
import { FileFilterProps, FileInfo } from '@cognite/sdk';
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
  setReverse,
  setSortKey,
  setCurrentPage,
  setPageSize,
  setMapTableTabKey,
  setExplorerSelectedFiles,
  setSelectedAllExplorerFiles,
  setDefaultTimestampKey,
} from 'src/modules/Explorer/store/slice';
import { selectExplorerAllFilesSelected } from 'src/modules/Explorer/store/selectors';
import {
  useIsSelectedInExplorer,
  useExplorerFilesSelected,
} from 'src/modules/Explorer/store/hooks';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { PaginationWrapper } from 'src/modules/Common/Components/SorterPaginationWrapper/PaginationWrapper';
import {
  PageSize,
  PaginatedTableProps,
} from 'src/modules/Common/Components/FileTable/types';
import { SortKeys } from 'src/modules/Common/Utils/SortUtils';

export const ExplorerSearchResults = ({
  reFetchProp,
  currentView,
  query = '',
  filter = {},
  selectedIds,
  ...otherProps
}: {
  reFetchProp?: boolean;
  currentView: ViewMode;
  query?: string;
  filter?: FileFilterProps;
  focusedId: number | null;
  selectedIds: number[];
  isLoading: boolean;
  onItemClick: (item: TableDataItem) => void;
  onItemSelect: (item: TableDataItem, selected: boolean) => void;
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

  const defaultTimestampKey = useSelector(
    ({ explorerReducer }: RootState) =>
      explorerReducer.sortMeta.defaultTimestampKey
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

  const sortPaginateControls = useMemo(
    () => ({
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
      setPageSize: (pageSize: PageSize) => {
        dispatch(setPageSize(pageSize));
      },
    }),
    [sortPaginateState]
  );

  const renderCell = useCallback(
    (cellProps: any) => (
      <FileGridPreview
        mode={VisionMode.Explore}
        {...cellProps}
        onItemSelect={otherProps.onItemSelect}
        isSelected={useIsSelectedInExplorer}
        isActionDisabled={useExplorerFilesSelected}
      />
    ),
    [otherProps.onItemSelect]
  );

  useEffect(() => {
    if (sortPaginateControls.sortKey === SortKeys.uploadedTime) {
      dispatch(setDefaultTimestampKey(SortKeys.uploadedTime));
    }
    if (sortPaginateControls.sortKey === SortKeys.createdTime) {
      dispatch(setDefaultTimestampKey(SortKeys.createdTime));
    }
  }, [sortPaginateControls.sortKey]);

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
          {(resultProps: { data: ResultData[]; totalCount: number }) => {
            return (
              <PaginationWrapper
                data={resultProps.data}
                totalCount={resultProps.totalCount}
                pagination={currentView !== 'map'}
                sortPaginateControls={sortPaginateControls}
                isLoading={otherProps.isLoading}
              >
                {(paginationProps) => {
                  const renderView = (
                    props: {
                      data: ResultData[];
                      totalCount: number;
                    } & PaginatedTableProps<TableDataItem>
                  ) => {
                    if (currentView === 'grid') {
                      return (
                        <PageBasedGridView
                          {...otherProps}
                          {...props}
                          renderCell={renderCell}
                        />
                      );
                    }
                    if (currentView === 'map') {
                      return (
                        <MapView
                          {...otherProps}
                          {...props}
                          selectedIds={selectedIds}
                          allRowsSelected={allFilesSelected}
                          onSelectAllRows={handleSelectAllFiles}
                          mapTableTabKey={{ activeKey, setActiveKey }}
                          onSelectPage={handleSetSelectedFiles}
                          pageSize={sortPaginateState.pageSize}
                          setPageSize={sortPaginateControls.setPageSize}
                        />
                      );
                    }

                    return (
                      <FileTableExplorer
                        modalView={currentView === 'modal'}
                        {...otherProps}
                        {...props}
                        selectedIds={selectedIds}
                        allRowsSelected={allFilesSelected}
                        onSelectAllRows={handleSelectAllFiles}
                        onSelectPage={handleSetSelectedFiles}
                        rowKey="rowKey"
                        defaultTimestampKey={defaultTimestampKey}
                      />
                    );
                  };

                  return (
                    <>
                      {renderView({
                        ...paginationProps,
                        totalCount: resultProps.totalCount,
                      })}
                    </>
                  );
                }}
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
