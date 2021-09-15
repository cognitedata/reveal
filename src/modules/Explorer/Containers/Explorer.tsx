/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import FilterToggleButton from 'src/modules/Explorer/Components/FilterToggleButton';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { lightGrey } from 'src/utils/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { ExplorerSearchResults } from 'src/modules/Explorer/Containers/ExplorerSearchResults';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import { TableDataItem, ViewMode } from 'src/modules/Common/types';
import { ExplorerToolbar } from 'src/modules/Explorer/Containers/ExplorerToolbar';
import { FileState } from 'src/modules/Common/filesSlice';
import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import { useHistory } from 'react-router-dom';
import {
  getLink,
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { MAX_SELECT_COUNT } from 'src/constants/ExplorerConstants';
import { FileDownloaderModal } from 'src/modules/Common/Components/FileDownloaderModal/FileDownloaderModal';
import { BulkEditModal } from 'src/modules/Common/Components/BulkEdit/BulkEditModal';
import { updateBulk } from 'src/store/thunks/updateBulk';
import { FetchFilesById } from 'src/store/thunks/FetchFilesById';
import { pushMetric } from 'src/utils/pushMetric';
import { PopulateProcessFiles } from 'src/store/thunks/PopulateProcessFiles';
import { PopulateReviewFiles } from 'src/store/thunks/PopulateReviewFiles';
import {
  BulkEditTempState,
  setBulkEditModalVisibility,
  setBulkEditTemp,
  setFileDownloadModalVisibility,
} from 'src/modules/Common/commonSlice';
import {
  setExplorerCurrentView,
  setExplorerFileSelectState,
  setExplorerQueryString,
  setExplorerFocusedFileId,
  hideExplorerFileMetadata,
  showExplorerFileMetadata,
  toggleExplorerFilterView,
  selectExplorerSelectedFileIds,
  setExplorerFileUploadModalVisibility,
  selectExplorerAllSelectedFiles,
  addExplorerUploadedFileId,
  clearExplorerStateOnTransition,
} from '../store/explorerSlice';

import { FilterSidePanel } from './FilterSidePanel';

pushMetric('Vision.Explorer');

const Explorer = () => {
  const history = useHistory();

  const showFilter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFilter
  );
  const filter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.filter
  );
  const showMetadata = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFileMetadata
  );
  const focusedFileId = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.focusedFileId
  );
  const currentView = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.currentView
  );
  const query = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.query
  );
  const showFileUploadModal = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFileUploadModal
  );
  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIds(state.explorerReducer)
  );
  const selectedFiles: FileState[] = useSelector(
    ({ explorerReducer }: RootState) => {
      return selectExplorerAllSelectedFiles(explorerReducer);
    }
  );
  const showFileDownloadModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showFileDownloadModal
  );
  const showBulkEditModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showBulkEditModal
  );
  const bulkEditTemp = useSelector(
    ({ commonReducer }: RootState) => commonReducer.bulkEditTemp
  );
  const uploadedFileIds = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.uploadedFileIds
  );

  const queryClient = new QueryClient();

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearExplorerStateOnTransition());
    };
  }, []);

  const handleSearch = (text: string) => {
    dispatch(setExplorerQueryString(text));
  };

  const handleItemClick = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { menuActions, rowKey, ...file }: TableDataItem,
    showFileDetailsOnClick: boolean = true
  ) => {
    dispatch(FetchFilesById([file.id]));
    dispatch(setExplorerFocusedFileId(file.id));
    if (showFileDetailsOnClick) {
      dispatch(showExplorerFileMetadata());
    }
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setExplorerFileSelectState(item.id, selected));
  };

  const onUploadSuccess = (fileId: number) => {
    dispatch(addExplorerUploadedFileId(fileId));
  };

  const onFinishUpload = () => {
    dispatch(PopulateProcessFiles(uploadedFileIds));
    history.push(getLink(workflowRoutes.process));
  };

  const handleMetadataClose = () => {
    dispatch(hideExplorerFileMetadata());
  };

  const onUpload = () => {
    dispatch(setExplorerFileUploadModalVisibility(true));
  };

  const onDownload = () => {
    dispatch(setFileDownloadModalVisibility(true));
  };

  const onContextualise = () => {
    dispatch(PopulateProcessFiles(selectedFileIds));
    history.push(getLink(workflowRoutes.process));
  };
  const onReview = async () => {
    dispatch(PopulateReviewFiles(selectedFileIds));
    history.push(
      // selecting first item in review
      getParamLink(
        workflowRoutes.review,
        ':fileId',
        String(selectedFileIds[0])
      ),
      { from: 'explorer' }
    );
  };

  const onFileDetailReview = () => {
    if (focusedFileId) {
      dispatch(PopulateReviewFiles([focusedFileId]));
      history.push(
        getParamLink(workflowRoutes.review, ':fileId', String(focusedFileId)),
        { from: 'explorer' }
      );
    }
  };

  const setBulkEdit = (value: BulkEditTempState) => {
    dispatch(setBulkEditTemp(value));
  };
  const onFinishBulkEdit = () => {
    dispatch(updateBulk({ selectedFiles, bulkEditTemp }));
    onCloseBulkEdit();
  };
  const onCloseBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(false));
    setBulkEdit({});
  };

  return (
    <>
      <Deselect />
      <FileUploadModal
        enableProcessAfter
        onUploadSuccess={onUploadSuccess}
        onFinishUpload={onFinishUpload}
        showModal={showFileUploadModal}
        onCancel={() => dispatch(setExplorerFileUploadModalVisibility(false))}
      />
      <FileDownloaderModal
        fileIds={selectedFileIds}
        showModal={showFileDownloadModal}
        onCancel={() => dispatch(setFileDownloadModalVisibility(false))}
      />
      <StatusToolBar current="Vision Explore" />
      <Wrapper>
        <QueryClientProvider client={queryClient}>
          {showFilter && (
            <FilterPanel>
              <FilterSidePanel />
            </FilterPanel>
          )}

          <TablePanel showDrawer={showMetadata} showFilter={showFilter}>
            {!showFilter ? (
              <div
                style={{
                  borderRight: `1px solid ${Colors['greyscale-grey3'].hex()}`,
                  padding: '10px',
                  zIndex: 1,
                }}
              >
                <FilterToggleButton
                  toggleOpen={() => dispatch(toggleExplorerFilterView())}
                />
              </div>
            ) : undefined}

            <ViewContainer>
              <ExplorerToolbar
                query={query}
                currentView={currentView}
                selectedCount={selectedFileIds.length}
                maxSelectCount={MAX_SELECT_COUNT}
                onViewChange={(view) =>
                  dispatch(setExplorerCurrentView(view as ViewMode))
                }
                onSearch={handleSearch}
                onUpload={onUpload}
                onDownload={onDownload}
                onContextualise={onContextualise}
                onReview={onReview}
                onBulkEdit={() => dispatch(setBulkEditModalVisibility(true))}
              />
              <ExplorerSearchResults
                filter={filter}
                onClick={handleItemClick}
                onRowSelect={handleRowSelect}
                query={query}
                selectedId={focusedFileId || undefined}
                currentView={currentView}
              />
            </ViewContainer>
          </TablePanel>
          {showMetadata && focusedFileId && (
            // eslint-disable-next-line  @cognite/no-number-z-index
            <DrawerContainer style={{ zIndex: 1 }}>
              <QueryClientProvider client={queryClient}>
                <FileDetails
                  fileId={focusedFileId}
                  onClose={handleMetadataClose}
                  onReview={onFileDetailReview}
                />
              </QueryClientProvider>
            </DrawerContainer>
          )}
          <BulkEditModal
            showModal={showBulkEditModal}
            selectedFiles={selectedFiles}
            bulkEditTemp={bulkEditTemp}
            onCancel={onCloseBulkEdit}
            setBulkEditTemp={setBulkEdit}
            onFinishBulkEdit={onFinishBulkEdit}
          />
        </QueryClientProvider>
      </Wrapper>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 40px);
  background: #fff;
  overflow: hidden;
`;

const FilterPanel = styled.div`
  display: flex;
  flex: 0 1 318px;
  flex-direction: column;
  border-right: 1px solid ${lightGrey};
  z-index: 1;
`;

interface tablePanelProps {
  showFilter: boolean;
  showDrawer: boolean;
}
const TablePanel = styled.div<tablePanelProps>`
  flex: 1;
  display: flex;
  flex-direction: row;
  width: ${(props) =>
    `calc(100% - ${
      (props.showDrawer ? 400 : 0) + (props.showFilter ? 318 : 0)
    }px)`};
  border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
  height: 100%;
`;

const ViewContainer = styled.div`
  height: 100%;
  width: 100%;
  padding: 20px 16px;
  display: grid;
  grid-template-rows: 32px 40px auto;
  grid-template-columns: 100%;
  grid-row-gap: 15px;
`;

const DrawerContainer = styled.div`
  width: 400px;
  border-left: 1px solid #d9d9d9;
  box-sizing: content-box;
  height: 100%;
  flex-shrink: 0;
  overflow: auto;
  background: white;
`;

const DeselectContainer = styled.div`
  position: fixed;
  z-index: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Deselect = () => {
  const dispatch = useDispatch();
  const focusedFileId = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.focusedFileId
  );
  return (
    <DeselectContainer
      onClick={() => {
        if (focusedFileId) {
          dispatch(setExplorerFocusedFileId(null));
        }
      }}
    />
  );
};

export default Explorer;
