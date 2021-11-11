import React, { useEffect, useMemo } from 'react';
import {
  selectAllFilesSelected,
  setFileSelectState,
  setSelectedAllFiles,
  setSelectedFiles,
} from 'src/modules/Common/store/filesSlice';
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
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { PaginationWrapper } from 'src/modules/Common/Components/SorterPaginationWrapper/PaginationWrapper';

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

  const allFilesSelected = useSelector((state: RootState) =>
    selectAllFilesSelected(state.filesSlice)
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

  const menuActions: FileActions = {
    // TODO: should onDelete be added here as well?
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
  };

  const data: ResultData[] = useMemo(
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
    dispatch(FetchFilesById(processFileIds));
  }, [processFileIds]);

  const handleItemClick = (
    item: TableDataItem,
    showFileDetailsOnClick: boolean = true
  ) => {
    dispatch(setFocusedFileId(item.id));
    if (showFileDetailsOnClick) {
      dispatch(showFileMetadata());
    }
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setFileSelectState(item.id, selected));
  };

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

  const RenderView = (props: { data: TableDataItem[] }) => {
    if (!props.data.length) {
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
          {...props}
          onItemClick={handleItemClick}
          onItemSelect={handleRowSelect}
          totalCount={data.length}
          selectedIds={selectedFileIds}
          isLoading={isLoading}
          renderCell={(cellProps: any) => (
            <FileGridPreview
              mode={VisionMode.Contextualize}
              actionDisabled={!!selectedFileIds.length}
              {...cellProps}
            />
          )}
        />
      );
    }
    if (currentView === 'map') {
      return (
        <MapView
          {...props}
          onItemSelect={handleRowSelect}
          onItemClick={handleItemClick}
          focusedId={focusedFileId}
          totalCount={data.length}
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
        {...props}
        onItemSelect={handleRowSelect}
        onItemClick={handleItemClick}
        focusedId={focusedFileId}
        totalCount={data.length}
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
        data={data}
        totalCount={data.length}
        pagination
        sortPaginateControls={sortPaginateControls}
        isLoading={isLoading}
      >
        {(paginationProps) => <RenderView {...paginationProps} />}
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
