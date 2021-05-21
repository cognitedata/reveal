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
import { setFileSelectState } from 'src/modules/Common/filesSlice';
import { ExplorerSearchResults } from 'src/modules/Explorer/Containers/ExplorerSearchResults';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import { TableDataItem, ViewMode } from 'src/modules/Common/types';
import { ExplorerToolbar } from 'src/modules/Explorer/Containers/ExplorerToolbar';
import {
  setCurrentView,
  setFilter,
  setQueryString,
  setSelectedFileIdExplorer,
  showExplorerFileMetadata,
  toggleExplorerFileMetadata,
  toggleFilterView,
} from '../store/explorerSlice';

const Explorer = () => {
  const showFilter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFilter
  );
  const filter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.filter
  );
  const showMetadata = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFileMetadata
  );
  const fileId = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.selectedFileId
  );
  const currentView = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.currentView
  );
  const query = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.query
  );
  const queryClient = new QueryClient();

  const dispatch = useDispatch();

  const handleSearch = (text: string) => {
    dispatch(setQueryString(text));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleItemClick = (item: TableDataItem) => {
    dispatch(setSelectedFileIdExplorer(item.id));
    dispatch(showExplorerFileMetadata());
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setFileSelectState(item.id, selected));
  };

  const handleMetadataClose = () => {
    dispatch(toggleExplorerFileMetadata());
  };

  return (
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
                    onClick={() => dispatch(toggleFilterView())}
                  />
                </HideFiltersTooltip>
              </Col>
            </HeaderRow>
            <FiltersContainer>
              <FileFilters
                filter={filter}
                setFilter={(newFilter) => {
                  dispatch(setFilter(newFilter));
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
                toggleOpen={() => dispatch(toggleFilterView())}
              />
            </div>
          ) : undefined}

          <ViewContainer>
            <ExplorerToolbar
              query={query}
              currentView={currentView}
              onViewChange={(view) =>
                dispatch(setCurrentView(view as ViewMode))
              }
              onSearch={handleSearch}
            />
            <ExplorerSearchResults
              filter={filter}
              onClick={handleItemClick}
              onRowSelect={handleRowSelect}
              query={query}
              selectedId={fileId || undefined}
              currentView={currentView}
            />
          </ViewContainer>
        </TablePanel>
        {showMetadata && (
          <DrawerContainer>
            <QueryClientProvider client={queryClient}>
              <FileDetails fileId={fileId} onClose={handleMetadataClose} />
            </QueryClientProvider>
          </DrawerContainer>
        )}
      </QueryClientProvider>
    </Wrapper>
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
`;

const FiltersContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  overflow: auto;
  height: 100%;
`;

const ViewContainer = styled.div`
  flex: 1 1 auto;
  flex-direction: column;
  overflow: auto;
  height: 100%;
  padding-left: 16px;
  padding-right: 16px;
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
`;

export default Explorer;
