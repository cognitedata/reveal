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
  selectIsPollingComplete,
  setMapTableTabKey,
  setFocusedFileId,
  selectProcessSortedFiles,
  selectProcessSelectedFileIdsInSortedOrder,
  showFileMetadata,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
  useIsSelectedInProcess,
  useProcessFilesSelected,
  selectUnfinishedJobs,
} from 'src/modules/Process/processSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { MapView } from 'src/modules/Common/Components/MapView/MapView';
import { resetEditHistory } from 'src/modules/FileDetails/fileDetailsSlice';
import { FileTable } from 'src/modules/Common/Components/FileTable/FileTable';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { Prompt, useHistory } from 'react-router-dom';
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

export const ProcessResults = ({ currentView }: { currentView: ViewMode }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const focusedFileId = useSelector(
    ({ processSlice }: RootState) => processSlice.focusedFileId
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

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
        dispatch(DeleteFilesById([id]));
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
    [processFiles, menuActions, showSelectFromExploreModal]
  );

  useEffect(() => {
    if (processFileIds.length) dispatch(FetchFilesById(processFileIds));
  }, [processFileIds]);

  const handleItemClick = useCallback(
    (item: TableDataItem, showFileDetailsOnClick: boolean = true) => {
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

  const promptMessage =
    'Are you sure you want to leave or refresh this page? The session state and all unsaved processing data will be lost. Already saved processing data can be accessed from the Image explorer on the front page.';

  window.onbeforeunload = (event: any) => {
    // prompt on reload, if in a session and there are files
    if (
      !window.location.pathname.includes('/vision/workflow') ||
      !processFiles.length
    ) {
      return;
    }
    const e = event || window.event;
    e.returnValue = promptMessage; // NOTE: only some browsers show this message
    // eslint-disable-next-line consistent-return
    return promptMessage;
  };

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
      <Prompt
        when={!isPollingFinished}
        message={(location, _) => {
          return location.pathname.includes('vision/workflow/review/') // exclude review page
            ? true
            : promptMessage;
        }}
      />
      <Prompt
        message={(location, _) => {
          return location.pathname.includes('vision/workflow/') ||
            processFiles.length === 0 // can freely navigate in workflow or if no files.
            ? true
            : promptMessage;
        }}
      />
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
