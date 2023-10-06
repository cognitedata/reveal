import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { ClearExplorerStateOnTransition } from '../../../store/thunks/Explorer/ClearExplorerStateOnTransition';
import { FetchFilesById } from '../../../store/thunks/Files/FetchFilesById';
import { PopulateReviewFiles } from '../../../store/thunks/Review/PopulateReviewFiles';
import { pushMetric } from '../../../utils/pushMetric';
import { getParamLink, workflowRoutes } from '../../../utils/workflowRoutes';
import { VerticalContainer } from '../../Common/Components/VerticalContainer';
import { useContextMenu } from '../../Common/hooks/useContextMenu';
import { TableDataItem } from '../../Common/types';
import { FileDetails } from '../../FileDetails/Containers/FileDetails';
import { cancelFileDetailsEdit } from '../../FileDetails/slice';
import FilterToggleButton from '../../FilterSidePanel/Components/FilterToggleButton';
import { FilterSidePanel } from '../../FilterSidePanel/Containers/FilterSidePanel';
import { StatusToolBar } from '../../Process/Containers/StatusToolBar';
import { selectExplorerSelectedFileIdsInSortedOrder } from '../store/selectors';
import {
  hideFileMetadata,
  setExplorerFileSelectState,
  setFocusedFileId,
  showFileMetadata,
  toggleExplorerFilterView,
} from '../store/slice';

import { ContextMenuContainer } from './ContextMenuContainer';
import { ExplorerBulkEditModalContainer } from './ExplorerBulkEditModalContainer';
import { ExplorerFileDownloadModalContainer } from './ExplorerFileDownloadModalContainer';
import { ExplorerFileUploadModalContainer } from './ExplorerFileUploadModalContainer';
import { ExplorerModelTrainingModalContainer } from './ExplorerModelTrainingModalContainer';
import { ExplorerSearchResults } from './ExplorerSearchResults';
import { ExplorerToolbarContainer } from './ExplorerToolbarContainer';

const Explorer = () => {
  const {
    contextMenuDataItem,
    contextMenuAnchorPoint,
    showContextMenu,
    setContextMenuDataItem,
    setContextMenuAnchorPoint,
    setShowContextMenu,
  } = useContextMenu();

  const navigate = useNavigate();
  const dispatch = useThunkDispatch();

  const [reFetchProp, setReFetchProp] = useState(false);
  const reFetch = useCallback(() => setReFetchProp((i) => !i), []);

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

  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIdsInSortedOrder(state)
  );

  const isLoading = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.isLoading || false
  );

  useEffect(() => {
    pushMetric('Vision.Explorer');
    return () => {
      dispatch(ClearExplorerStateOnTransition());
    };
  }, []);

  const handleItemClick = useCallback(
    (item: TableDataItem, showFileDetailsOnClick = true) => {
      dispatch(cancelFileDetailsEdit());
      dispatch(FetchFilesById([item.id]));
      dispatch(setFocusedFileId(item.id));
      if (showFileDetailsOnClick) {
        dispatch(showFileMetadata());
      }
    },
    []
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
      dispatch(FetchFilesById([item.id]));
      dispatch(setFocusedFileId(item.id));
    },
    []
  );

  const handleRowSelect = useCallback(
    (item: TableDataItem, selected: boolean) => {
      dispatch(setExplorerFileSelectState({ fileId: item.id, selected }));
    },
    [dispatch]
  );

  const handleMetadataClose = useCallback(() => {
    dispatch(hideFileMetadata());
  }, []);

  const onFileDetailReview = useCallback(() => {
    if (focusedFileId) {
      dispatch(PopulateReviewFiles([focusedFileId]));
      navigate(
        getParamLink(workflowRoutes.review, ':fileId', String(focusedFileId))
      );
    }
  }, [focusedFileId]);

  return (
    <VerticalContainer>
      <StatusToolBar current="Image and video management" />
      <Deselect />
      <ExplorerFileUploadModalContainer refetch={reFetch} />
      <ExplorerFileDownloadModalContainer />
      <Wrapper>
        {showFilter && (
          <FilterPanel>
            <FilterSidePanel />
          </FilterPanel>
        )}

        <TablePanel showDrawer={showMetadata} showFilter={showFilter}>
          {!showFilter ? (
            <div
              style={{
                borderRight: `1px solid ${Colors['border--muted']}`,
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
            <ExplorerToolbarContainer
              query={query}
              selectedCount={selectedFileIds.length}
              isLoading={isLoading}
              currentView={currentView}
              reFetch={reFetch}
            />
            <ExplorerSearchResults
              reFetchProp={reFetchProp}
              currentView={currentView}
              filter={filter}
              query={query}
              focusedId={focusedFileId}
              selectedIds={selectedFileIds}
              isLoading={isLoading}
              onItemClick={handleItemClick}
              onItemRightClick={handleContextMenuOpen}
              onItemSelect={handleRowSelect}
            />
          </ViewContainer>
        </TablePanel>
        {showMetadata && focusedFileId && (
          <DrawerContainer style={{ zIndex: 2 }}>
            <FileDetails
              fileId={focusedFileId}
              onClose={handleMetadataClose}
              onReview={onFileDetailReview}
            />
          </DrawerContainer>
        )}
        {showContextMenu && contextMenuDataItem && (
          <ContextMenuContainer
            rowData={contextMenuDataItem}
            position={contextMenuAnchorPoint}
          />
        )}
        <ExplorerBulkEditModalContainer />
        <ExplorerModelTrainingModalContainer />
      </Wrapper>
    </VerticalContainer>
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
  border-right: 1px solid ${Colors['border--muted']};
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
  border-right: 1px solid ${Colors['border--muted']};
  height: 100%;
  overflow-x: auto;
`;

const ViewContainer = styled.div`
  height: 100%;
  width: 100%;
  padding: 20px 16px;
  min-width: 1200px;
  display: grid;
  grid-template-rows: 35px 40px 1fr;
  grid-template-columns: 1fr;
  grid-row-gap: 15px;
`;

const DrawerContainer = styled.div`
  width: 400px;
  border-left: 1px solid #d9d9d9;
  box-sizing: content-box;
  height: 100%;
  flex-shrink: 0;
  background: white;
`;

const DeselectContainer = styled.div`
  position: fixed;
  z-index: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
`;

const Deselect = () => {
  const dispatch = useThunkDispatch();
  const focusedFileId = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.focusedFileId
  );
  return (
    <DeselectContainer
      onClick={() => {
        if (focusedFileId) {
          dispatch(setFocusedFileId(null));
        }
      }}
    />
  );
};

export default Explorer;
