import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import noop from 'lodash/noop';

import { FileFilterProps } from '@cognite/sdk';

import { VisionMode } from '../../../constants/enums/VisionEnums';
import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { FileGridPreview } from '../../Common/Components/FileGridPreview/FileGridPreview';
import { FileTableExplorer } from '../../Common/Components/FileTable/FileTableExplorer';
import {
  PageSize,
  PaginatedTableProps,
} from '../../Common/Components/FileTable/types';
import { PageBasedGridView } from '../../Common/Components/GridView/PageBasedGridView';
import { MapView } from '../../Common/Components/MapView/MapView';
import { PaginationWrapper } from '../../Common/Components/SorterPaginationWrapper/PaginationWrapper';
import {
  ResultData,
  SelectFilter,
  TableDataItem,
  ViewMode,
} from '../../Common/types';
import { SortKeys } from '../../Common/Utils/SortUtils';
import {
  useIsSelectedInExplorer,
  useExplorerFilesSelected,
} from '../store/hooks';
import { selectExplorerAllFilesSelected } from '../store/selectors';
import {
  setReverse,
  setSortKey,
  setCurrentPage,
  setPageSize,
  setMapTableTabKey,
  setExplorerSelectedFiles,
  setSelectedAllExplorerFiles,
  setDefaultTimestampKey,
  setExploreModalCurrentPage,
  setExploreModalPageSize,
  setExploreModalReverse,
  setExploreModalSortKey,
} from '../store/slice';

import { ResultTableLoader } from './ResultTableLoader';

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
  onItemRightClick?: (event: MouseEvent, item: TableDataItem) => void;
  onItemSelect: (item: TableDataItem, selected: boolean) => void;
}) => {
  const dispatch = useThunkDispatch();

  const allFilesSelected = useSelector((state: RootState) =>
    selectExplorerAllFilesSelected(state.explorerReducer)
  );

  const activeKey = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.mapTableTabKey
  );

  const sortPaginateState = useSelector(({ explorerReducer }: RootState) =>
    currentView === 'modal'
      ? explorerReducer.exploreModal.sortMeta
      : explorerReducer.sortMeta
  );

  const sortPaginateStateControls =
    currentView === 'modal'
      ? {
          setSortKey: (sortKey: string) => {
            dispatch(setExploreModalSortKey(sortKey));
          },
          setReverse: (reverse: boolean) => {
            dispatch(setExploreModalReverse(reverse));
          },
          setCurrentPage: (currentPage: number) => {
            dispatch(setExploreModalCurrentPage(currentPage));
          },
          setPageSize: (pageSize: PageSize) => {
            dispatch(setExploreModalPageSize(pageSize));
          },
        }
      : {
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
        };

  const defaultTimestampKey = useSelector(
    ({ explorerReducer }: RootState) =>
      explorerReducer.sortMeta.defaultTimestampKey
  );

  const handleSelectAllFiles = useCallback(
    (value: boolean, selectFilter?: SelectFilter) => {
      dispatch(
        setSelectedAllExplorerFiles({
          selectStatus: value,
          filter: selectFilter,
        })
      );
    },
    []
  );
  const handleSetSelectedFiles = useCallback((fileIds: number[]) => {
    dispatch(setExplorerSelectedFiles(fileIds));
  }, []);

  const setActiveKey = useCallback((key: string) => {
    dispatch(setMapTableTabKey({ mapTableTabKey: key }));
  }, []);

  const sortPaginateControls = useMemo(
    () => ({
      sortKey: sortPaginateState.sortKey,
      reverse: sortPaginateState.reverse,
      currentPage: sortPaginateState.currentPage,
      pageSize: sortPaginateState.pageSize,
      setSortKey: sortPaginateStateControls.setSortKey,
      setReverse: sortPaginateStateControls.setReverse,
      setCurrentPage: sortPaginateStateControls.setCurrentPage,
      setPageSize: sortPaginateStateControls.setPageSize,
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
        onItemRightClick={otherProps.onItemRightClick}
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

  const mapTableTabKey = useMemo(() => {
    return { activeKey, setActiveKey };
  }, [activeKey]);

  return (
    <ResultContainer>
      <ResultTableLoader
        css={{ height: '100%', width: '100%' }}
        type="file"
        filter={filter}
        query={query}
        reFetchProp={reFetchProp}
      >
        {(data, totalCount) => {
          return (
            <PaginationWrapper
              data={data}
              totalCount={totalCount}
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
                        onItemClicked={otherProps.onItemClick}
                        renderCell={renderCell}
                        onSelect={noop}
                        isSelected={() => false}
                        selectionMode="single"
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
                        mapTableTabKey={mapTableTabKey}
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
                      totalCount: totalCount,
                    })}
                  </>
                );
              }}
            </PaginationWrapper>
          );
        }}
      </ResultTableLoader>
    </ResultContainer>
  );
};

const ResultContainer = styled.div`
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
`;
