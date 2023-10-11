import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import noop from 'lodash/noop';

import { Detail } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import { VisionMode } from '../../../constants/enums/VisionEnums';
import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { RetrieveAnnotations } from '../../../store/thunks/Annotation/RetrieveAnnotations';
import { DeleteFilesById } from '../../../store/thunks/Files/DeleteFilesById';
import { FetchFilesById } from '../../../store/thunks/Files/FetchFilesById';
import { PollJobs } from '../../../store/thunks/Process/PollJobs';
import { PopulateReviewFiles } from '../../../store/thunks/Review/PopulateReviewFiles';
import { getParamLink, workflowRoutes } from '../../../utils/workflowRoutes';
import { FileGridPreview } from '../../Common/Components/FileGridPreview/FileGridPreview';
import { FileTable } from '../../Common/Components/FileTable/FileTable';
import {
  PageSize,
  PaginatedTableProps,
} from '../../Common/Components/FileTable/types';
import { PageBasedGridView } from '../../Common/Components/GridView/PageBasedGridView';
import { MapView } from '../../Common/Components/MapView/MapView';
import { PaginationWrapper } from '../../Common/Components/SorterPaginationWrapper/PaginationWrapper';
import { useContextMenu } from '../../Common/hooks/useContextMenu';
import { selectAllFilesSelected } from '../../Common/store/files/selectors';
import {
  setFileSelectState,
  setSelectedFiles,
  setSelectedAllFiles,
} from '../../Common/store/files/slice';
import {
  FileActions,
  ResultData,
  SelectFilter,
  TableDataItem,
  ViewMode,
} from '../../Common/types';
import { ContextMenuContainer } from '../../Explorer/Containers/ContextMenuContainer';
import {
  cancelFileDetailsEdit,
  resetEditHistory,
} from '../../FileDetails/slice';
import {
  useIsSelectedInProcess,
  useProcessFilesSelected,
} from '../store/hooks';
import {
  selectProcessSortedFiles,
  selectUnfinishedJobs,
  selectProcessSelectedFileIdsInSortedOrder,
} from '../store/selectors';
import {
  setMapTableTabKey,
  setFocusedFileId,
  showFileMetadata,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
} from '../store/slice';

export const ProcessResults = ({ currentView }: { currentView: ViewMode }) => {
  const {
    contextMenuDataItem,
    contextMenuAnchorPoint,
    showContextMenu,
    setContextMenuDataItem,
    setContextMenuAnchorPoint,
    setShowContextMenu,
  } = useContextMenu();

  const dispatch = useThunkDispatch();
  const navigate = useNavigate();
  const focusedFileId = useSelector(
    ({ processSlice }: RootState) => processSlice.focusedFileId
  );

  const processFileIds = useSelector(
    (state: RootState) => state.processSlice.fileIds
  );

  const processFiles = useSelector((state: RootState) =>
    selectProcessSortedFiles(state)
  );

  const unfinishedJobs = useSelector(({ processSlice }: RootState) =>
    selectUnfinishedJobs(processSlice)
  );

  const allFilesSelected = useSelector((state: RootState) =>
    selectAllFilesSelected(state.fileReducer, {
      // Select from processFileIds instead of fileReducer.files.allids
      // This is because the former contains the ids of the files that are
      // actually shown on the process page
      overridedFileIds: processFileIds,
    })
  );

  const selectedFileIds = useSelector((state: RootState) =>
    selectProcessSelectedFileIdsInSortedOrder(state)
  );

  const sortPaginateState = useSelector(
    ({ processSlice }: RootState) => processSlice.sortMeta
  );

  const isLoading = useSelector(
    ({ processSlice }: RootState) => processSlice.isLoading
  );

  // todo: remove this hack to force a rerender when explorer model closes
  const showSelectFromExploreModal = useSelector(
    ({ processSlice }: RootState) => processSlice.showExploreModal
  );

  const menuActions: FileActions = useMemo(
    () => ({
      onFileDetailsClicked: (fileInfo: FileInfo) => {
        dispatch(setFocusedFileId(fileInfo.id));
        dispatch(resetEditHistory());
        dispatch(showFileMetadata());
      },
      onReviewClick: (fileInfo: FileInfo) => {
        dispatch(PopulateReviewFiles(processFileIds));
        navigate(
          getParamLink(workflowRoutes.review, ':fileId', String(fileInfo.id))
        );
      },
      onFileDelete: (id: number) => {
        dispatch(DeleteFilesById({ fileIds: [id] }));
      },
    }),
    [dispatch, processFileIds]
  );

  const processTableRowData: ResultData[] = useMemo(
    () =>
      processFiles.map((file: FileInfo) => ({
        ...file,
        menuActions,
        mimeType: file.mimeType || '',
        rowKey: `process-${file.id}`,
      })),
    [processFiles, menuActions]
  );

  useEffect(() => {
    if (processFileIds.length) {
      dispatch(FetchFilesById(processFileIds));
      dispatch(
        RetrieveAnnotations({ fileIds: processFileIds, clearCache: true })
      );
    }
  }, [processFileIds, showSelectFromExploreModal]); // requires to fetch annotations when explorer modal is closed
  // since explorer modal clears the anntation state when it's loading its own annotations

  const handleItemClick = useCallback(
    (item: TableDataItem, showFileDetailsOnClick = true) => {
      dispatch(cancelFileDetailsEdit());
      dispatch(setFocusedFileId(item.id));
      if (showFileDetailsOnClick) {
        dispatch(showFileMetadata());
      }
    },
    [dispatch]
  );

  const handleContextMenuOpen = useCallback(
    (event: MouseEvent, item: TableDataItem) => {
      event.preventDefault();
      setContextMenuDataItem(item);
      setContextMenuAnchorPoint({
        x: event.pageX,
        y: event.pageY,
      });
      setShowContextMenu(true);
      dispatch(cancelFileDetailsEdit());
      dispatch(setFocusedFileId(item.id));
    },
    []
  );

  const handleRowSelect = useCallback(
    (item: TableDataItem, selected: boolean) => {
      dispatch(setFileSelectState(item.id, selected));
    },
    [dispatch]
  );

  const handleSelectAllFiles = (
    value: boolean,
    selectFilter?: SelectFilter
  ) => {
    dispatch(
      setSelectedAllFiles({
        selectStatus: value,
        filter: selectFilter,
        overridedFileIds: processFileIds,
      })
    );
  };
  const handleSetSelectedFiles = (fileIds: number[]) => {
    dispatch(setSelectedFiles(fileIds));
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
    setPageSize: (pageSize: PageSize) => {
      dispatch(setPageSize(pageSize));
    },
  };

  const activeKey = useSelector(
    ({ processSlice }: RootState) => processSlice.mapTableTabKey
  );
  const setActiveKey = (key: string) => {
    dispatch(setMapTableTabKey({ mapTableTabKey: key }));
  };

  const renderCell = useCallback(
    (cellProps: any) => (
      <FileGridPreview
        mode={VisionMode.Contextualize}
        {...cellProps}
        onItemSelect={handleRowSelect}
        isSelected={useIsSelectedInProcess}
        isActionDisabled={useProcessFilesSelected}
        onItemRightClick={handleContextMenuOpen}
      />
    ),
    []
  );

  useEffect(() => {
    // Resume Annotation Jobs
    dispatch(PollJobs(unfinishedJobs));
  }, []);

  return (
    <>
      <PaginationWrapper
        data={processTableRowData}
        totalCount={processTableRowData.length}
        pagination={currentView !== 'map'}
        sortPaginateControls={sortPaginateControls}
        isLoading={isLoading}
      >
        {(paginationProps) => {
          const renderView = ({
            data,
            ...otherProps
          }: {
            data: ResultData[];
            totalCount: number;
          } & PaginatedTableProps<TableDataItem>) => {
            if (!data.length) {
              return (
                <EmptyContainer>
                  <div className="header" />
                  <div className="main">
                    <Detail strong>
                      First select from existing files or upload new
                    </Detail>
                  </div>
                </EmptyContainer>
              );
            }
            if (currentView === 'grid') {
              return (
                <PageBasedGridView
                  data={data}
                  {...otherProps}
                  onItemClicked={handleItemClick}
                  isLoading={isLoading}
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
                  data={data}
                  {...otherProps}
                  onItemSelect={handleRowSelect}
                  onItemClick={handleItemClick}
                  onItemRightClick={handleContextMenuOpen}
                  focusedId={focusedFileId}
                  selectedIds={selectedFileIds}
                  allRowsSelected={allFilesSelected}
                  onSelectAllRows={handleSelectAllFiles}
                  onSelectPage={handleSetSelectedFiles}
                  mapTableTabKey={{ activeKey, setActiveKey }}
                  pageSize={sortPaginateState.pageSize}
                  setPageSize={sortPaginateControls.setPageSize}
                  isLoading={isLoading}
                />
              );
            }

            return (
              <FileTable
                data={data}
                {...otherProps}
                onItemSelect={handleRowSelect}
                onItemClick={handleItemClick}
                onItemRightClick={handleContextMenuOpen}
                focusedId={focusedFileId}
                selectedIds={selectedFileIds}
                allRowsSelected={allFilesSelected}
                onSelectAllRows={handleSelectAllFiles}
                onSelectPage={handleSetSelectedFiles}
                rowKey="rowKey"
              />
            );
          };

          return (
            <>
              {renderView({
                ...paginationProps,
                totalCount: processTableRowData.length,
              })}
            </>
          );
        }}
      </PaginationWrapper>
      {showContextMenu && contextMenuDataItem && (
        <ContextMenuContainer
          rowData={contextMenuDataItem}
          position={contextMenuAnchorPoint}
        />
      )}
    </>
  );
};

const EmptyContainer = styled.div`
  .main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 12px 20px;
    height: 500px;
    border: 1px solid #cccccc;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .header {
    width: 100%;
    height: 53px;
    background: #fafafa;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border-top: 1px solid #cccccc;
    border-left: 1px solid #cccccc;
    border-right: 1px solid #cccccc;
  }
`;
