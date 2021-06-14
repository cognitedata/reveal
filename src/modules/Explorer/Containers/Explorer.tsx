import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import FilterToggleButton from 'src/modules/Explorer/Components/FilterToggleButton';
import styled from 'styled-components';
import { Colors, Tooltip, Button, Title } from '@cognite/cogs.js';
import { Col, Row } from 'antd';
import { lightGrey } from 'src/utils/Colors';
import { FileFilters } from 'src/modules/Common/Components/Search/FileFilters';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { ExplorerSearchResults } from 'src/modules/Explorer/Containers/ExplorerSearchResults';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import { TableDataItem, ViewMode } from 'src/modules/Common/types';
import { ExplorerToolbar } from 'src/modules/Explorer/Containers/ExplorerToolbar';
import { addUploadedFile } from 'src/modules/Common/filesSlice';
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
import {
  setExplorerCurrentView,
  setExplorerFileSelectState,
  setExplorerFilter,
  setExplorerQueryString,
  setExplorerSelectedFileId,
  showExplorerFileMetadata,
  toggleExplorerFileMetadata,
  toggleExplorerFilterView,
  selectExplorerSelectedFileIds,
  setExplorerFileUploadModalVisibility,
} from '../store/explorerSlice';

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
  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIds(state.explorerReducer)
  );

  const queryClient = new QueryClient();

  const dispatch = useDispatch();

  const handleSearch = (text: string) => {
    dispatch(setExplorerQueryString(text));
  };

  const handleItemClick = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { menu, ...file }: TableDataItem,
    showFileDetailsOnClick: boolean = true
  ) => {
    dispatch(addUploadedFile(file as FileInfo));
    dispatch(setExplorerSelectedFileId(file.id));
    if (showFileDetailsOnClick) {
      dispatch(showExplorerFileMetadata());
    }
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setExplorerFileSelectState(item.id, selected));
  };

  const onUploadSuccess = React.useCallback(
    (file) => {
      dispatch(addUploadedFile(file));
    },
    [dispatch]
  );
  const handleMetadataClose = () => {
    dispatch(toggleExplorerFileMetadata());
  };

  const onUpload = () => {
    dispatch(setExplorerFileUploadModalVisibility(true));
  };
  const onContextualise = () => {
    // fetch latest
    dispatch(fetchFilesById(selectedFileIds.map((i) => ({ id: i }))));
    history.push(getLink(workflowRoutes.process));
  };
  const onReview = () => {
    // fetch latest
    dispatch(fetchFilesById(selectedFileIds.map((i) => ({ id: i }))));
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

  return (
    <>
      <FileUploadModal
        enableProcessAfter
        onUploadSuccess={onUploadSuccess}
        showModal={showFileUploadModal}
        onCancel={() => dispatch(setExplorerFileUploadModalVisibility(false))}
      />
      <StatusToolBar current="Vision Explore" />
      <Wrapper>
        <QueryClientProvider client={queryClient}>
          {showFilter && (
            <FilterPanel>
              <HeaderRow align="middle" justify="center">
                <Col flex="auto">
                  <Title level={4}> Filters</Title>
                </Col>
                <Col flex="none">
                  <HideFiltersTooltip content="Hide">
                    <Button
                      icon="PanelLeft"
                      onClick={() => dispatch(toggleExplorerFilterView())}
                    />
                  </HideFiltersTooltip>
                </Col>
              </HeaderRow>
              <FiltersContainer>
                <FileFilters
                  filter={filter}
                  setFilter={(newFilter) => {
                    dispatch(setExplorerFilter(newFilter));
                  }}
                />
              </FiltersContainer>
            </FilterPanel>
          )}

          <TablePanel showDrawer={showMetadata} showFilter={showFilter}>
            {!showFilter ? (
              <div
                style={{
                  borderRight: `1px solid ${Colors['greyscale-grey3'].hex()}`,
                  padding: '10px',
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
                onContextualise={onContextualise}
                onReview={onReview}
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
        </QueryClientProvider>
      </Wrapper>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
`;

const FilterPanel = styled.div`
  display: flex;
  flex: 0 1 318px;
  flex-direction: column;
  border-right: 1px solid ${lightGrey};
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

const FiltersContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  overflow: auto;
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

const HeaderRow = styled(Row)`
  padding-right: 16px;
  padding-left: 16px;
  padding-bottom: 20px;
  margin-top: 24px;
`;

const HideFiltersTooltip = styled(Tooltip)`
  margin-bottom: 8;
`;

const DrawerContainer = styled.div`
  width: 400px;
  border: 1px solid #d9d9d9;
  box-sizing: content-box;
  height: 100%;
  flex-shrink: 0;
  overflow: auto;
  background: white;
`;

export default Explorer;
