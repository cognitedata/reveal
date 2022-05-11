import React, { useCallback, useEffect, useMemo } from 'react';
import {
  setFileSelectState,
  setSelectedFiles,
  setSelectedAllFiles,
} from 'src/modules/Common/store/files/slice';
import { selectAllFilesSelected } from 'src/modules/Common/store/files/selectors';
import {
  FileActions,
  ResultData,
  SelectFilter,
  TableDataItem,
  ViewMode,
} from 'src/modules/Common/types';
import {
  setMapTableTabKey,
  setFocusedFileId,
  showFileMetadata,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
} from 'src/modules/Process/store/slice';
import {
  selectProcessSortedFiles,
  selectUnfinishedJobs,
  selectProcessSelectedFileIdsInSortedOrder,
} from 'src/modules/Process/store/selectors';
import {
  useIsSelectedInProcess,
  useProcessFilesSelected,
} from 'src/modules/Process/store/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { MapView } from 'src/modules/Common/Components/MapView/MapView';
import {
  cancelFileDetailsEdit,
  resetEditHistory,
} from 'src/modules/FileDetails/slice';
import { FileTable } from 'src/modules/Common/Components/FileTable/FileTable';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { useHistory } from 'react-router-dom';
import { FetchFilesById } from 'src/store/thunks/Files/FetchFilesById';
import { PopulateReviewFiles } from 'src/store/thunks/Review/PopulateReviewFiles';
import { getParamLink, workflowRoutes } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { Detail } from '@cognite/cogs.js';
import { PageBasedGridView } from 'src/modules/Common/Components/GridView/PageBasedGridView';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { FileInfo } from '@cognite/sdk';
import { PaginationWrapper } from 'src/modules/Common/Components/SorterPaginationWrapper/PaginationWrapper';
import { PaginatedTableProps } from 'src/modules/Common/Components/FileTable/types';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { PollJobs } from 'src/store/thunks/Process/PollJobs';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';

export const ProcessResults = ({ currentView }: { currentView: ViewMode }) => {
  const dispatch = useDispatch();
  const history = useHistory();
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
    selectAllFilesSelected(state.fileReducer)
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
        history.push(
          getParamLink(workflowRoutes.review, ':fileId', String(fileInfo.id)),
          { from: 'process' }
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
      processFiles.map((file) => ({
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
        RetrieveAnnotationsV1({ fileIds: processFileIds, clearCache: true })
      );
    }
  }, [processFileIds, showSelectFromExploreModal]); // requires to fetch annotations when explorer modal is closed
  // since explorer modal clears the anntation state when it's loading its own annotations

  const handleItemClick = useCallback(
    (item: TableDataItem, showFileDetailsOnClick: boolean = true) => {
      dispatch(cancelFileDetailsEdit());
      dispatch(setFocusedFileId(item.id));
      if (showFileDetailsOnClick) {
        dispatch(showFileMetadata());
      }
    },
    [dispatch]
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
      setSelectedAllFiles({ selectStatus: value, filter: selectFilter })
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
    setPageSize: (pageSize: number) => {
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
                  onItemClick={handleItemClick}
                  isLoading={isLoading}
                  renderCell={renderCell}
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
