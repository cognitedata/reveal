/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
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
import { addFileInfo, FileState } from 'src/modules/Common/filesSlice';
import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import { fetchFilesById } from 'src/store/thunks/fetchFilesById';
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
import { pushMetric } from 'src/utils/pushMetric';
import {
  setExplorerCurrentView,
  setExplorerFileSelectState,
  setExplorerQueryString,
  setExplorerSelectedFileId,
  hideExplorerFileMetadata,
  showExplorerFileMetadata,
  toggleExplorerFilterView,
  selectExplorerSelectedFileIds,
  setExplorerFileUploadModalVisibility,
  setExplorerFileDownloadModalVisibility,
  setBulkEditModalVisibility,
  BulkEditTempState,
  selectExplorerAllSelectedFiles,
  setBulkEditTemp,
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
  const clickedRowFileId = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.selectedFileId
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
  const showFileDownloadModal = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFileDownloadModal
  );
  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIds(state.explorerReducer)
  );
  const selectedFiles: FileState[] = useSelector(
    ({ explorerReducer }: RootState) => {
      return selectExplorerAllSelectedFiles(explorerReducer);
    }
  );
  const showBulkEditModal = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showBulkEditModal
  );
  const bulkEditTemp = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.bulkEditTemp
  );

  const queryClient = new QueryClient();

  const dispatch = useDispatch();

  const handleSearch = (text: string) => {
    dispatch(setExplorerQueryString(text));
  };

  const handleItemClick = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { menuActions, ...file }: TableDataItem,
    showFileDetailsOnClick: boolean = true
  ) => {
    dispatch(addFileInfo(file as FileInfo));
    dispatch(setExplorerSelectedFileId(file.id));
    if (showFileDetailsOnClick) {
      dispatch(showExplorerFileMetadata());
    }
  };

  const handleDeselect = () => {
    dispatch(setExplorerSelectedFileId(null));
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setExplorerFileSelectState(item.id, selected));
  };

  const onUploadSuccess = React.useCallback(
    (file) => {
      dispatch(addFileInfo(file));
    },
    [dispatch]
  );

  const handleMetadataClose = () => {
    dispatch(hideExplorerFileMetadata());
  };

  const onUpload = () => {
    dispatch(setExplorerFileUploadModalVisibility(true));
  };

  const onDownload = () => {
    dispatch(setExplorerFileDownloadModalVisibility(true));
  };

  const onContextualise = () => {
    // fetch latest
    dispatch(fetchFilesById(selectedFileIds.map((i) => ({ id: i }))));
    history.push(getLink(workflowRoutes.process));
  };
  const onReview = async () => {
    // fetch latest
    await dispatch(fetchFilesById(selectedFileIds.map((i) => ({ id: i }))));
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
    if (clickedRowFileId) {
      dispatch(fetchFilesById([{ id: clickedRowFileId }]));
      history.push(
        getParamLink(
          workflowRoutes.review,
          ':fileId',
          String(clickedRowFileId)
        ),
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
      <Deselect
        onClick={() => {
          handleDeselect();
        }}
      />
      <FileUploadModal
        enableProcessAfter
        onUploadSuccess={onUploadSuccess}
        showModal={showFileUploadModal}
        onCancel={() => dispatch(setExplorerFileUploadModalVisibility(false))}
      />
      <FileDownloaderModal
        fileIds={selectedFileIds}
        showModal={showFileDownloadModal}
        onCancel={() => dispatch(setExplorerFileDownloadModalVisibility(false))}
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
                selectedId={clickedRowFileId || undefined}
                currentView={currentView}
              />
            </ViewContainer>
          </TablePanel>
          {showMetadata && clickedRowFileId && (
            // eslint-disable-next-line  @cognite/no-number-z-index
            <DrawerContainer style={{ zIndex: 1 }}>
              <QueryClientProvider client={queryClient}>
                <FileDetails
                  fileId={clickedRowFileId}
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

const Deselect = styled.div`
  position: fixed;
  z-index: 0;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

export default Explorer;
