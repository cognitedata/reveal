/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import FilterToggleButton from 'src/modules/Explorer/Components/FilterToggleButton';
import {
  hideExplorerFileMetadata,
  selectExplorerSelectedFileIds,
  setExplorerCurrentView,
  setExplorerFileSelectState,
  setExplorerFileUploadModalVisibility,
  setExplorerFocusedFileId,
  setExplorerQueryString,
  showExplorerFileMetadata,
  toggleExplorerFilterView,
} from 'src/modules/Explorer/store/explorerSlice';
import { ClearExplorerStateOnTransition } from 'src/store/thunks/Explorer/ClearExplorerStateOnTransition';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { FetchFilesById } from 'src/store/thunks/Files/FetchFilesById';
import { PopulateProcessFiles } from 'src/store/thunks/Process/PopulateProcessFiles';
import { PopulateReviewFiles } from 'src/store/thunks/Review/PopulateReviewFiles';
import {
  getLink,
  getParamLink,
  workflowRoutes,
} from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { lightGrey } from 'src/utils/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { ExplorerSearchResults } from 'src/modules/Explorer/Containers/ExplorerSearchResults';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import { TableDataItem, ViewMode } from 'src/modules/Common/types';
import { ExplorerToolbar } from 'src/modules/Explorer/Containers/ExplorerToolbar';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import { useHistory } from 'react-router-dom';
import { MAX_SELECT_COUNT } from 'src/constants/ExplorerConstants';
import { pushMetric } from 'src/utils/pushMetric';
import isEqual from 'lodash-es/isEqual';
import {
  setBulkEditModalVisibility,
  setFileDownloadModalVisibility,
} from 'src/modules/Common/store/commonSlice';
import { ExplorerFileUploadModalContainer } from 'src/modules/Explorer/Containers/ExplorerFileUploadModalContainer';
import { ExplorerFileDownloadModalContainer } from 'src/modules/Explorer/Containers/ExplorerFileDownloadModalContainer';
import { ExplorerBulkEditModalContainer } from 'src/modules/Explorer/Containers/ExplorerBulkEditModalContainer';
import { FilterSidePanel } from './FilterSidePanel';

pushMetric('Vision.Explorer');

const Explorer = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const queryClient = new QueryClient();

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

  const selectedFileIds = useSelector(
    (state: RootState) => selectExplorerSelectedFileIds(state.explorerReducer),
    isEqual
  );

  useEffect(() => {
    return () => {
      dispatch(ClearExplorerStateOnTransition());
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

  const onDelete = () => {
    dispatch(DeleteFilesById(selectedFileIds));
  };

  return (
    <>
      <StatusToolBar current="Vision Explore" />
      <Deselect />
      <ExplorerFileUploadModalContainer />
      <ExplorerFileDownloadModalContainer />
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
                onDelete={onDelete}
              />
              <ExplorerSearchResults
                currentView={currentView}
                filter={filter}
                query={query}
                focusedId={focusedFileId || undefined}
                selectedFileIds={selectedFileIds}
                onClick={handleItemClick}
                onRowSelect={handleRowSelect}
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
          <ExplorerBulkEditModalContainer />
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
