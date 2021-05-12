import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import FilterToggleButton from 'src/modules/Explorer/Components/FilterToggleButton';
import styled from 'styled-components';
import { Colors, Tooltip, Button, Title } from '@cognite/cogs.js';
import { Col, Row } from 'antd';
import { FileFilterProps, FileInfo } from '@cognite/cdf-sdk-singleton';
import { lightGrey } from 'src/utils/Colors';
import { FileFilters } from 'src/modules/Common/Components/Search/FileFilters';
import {
  EnsureNonEmptyResource,
  GridTable,
  TableProps,
} from '@cognite/data-exploration';
import { ResultAnnotationLoader } from 'src/modules/Explorer/Containers/ResultAnnotationLoader';
import { MapView } from 'src/modules/Common/Components/MapView/MapView';
import { setFileSelectState } from 'src/modules/Common/filesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FileTableExplorer } from 'src/modules/Common/Components/FileTable/FileTableExplorer';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import {
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/modules/Process/processSlice';
import { RootState } from 'src/store/rootReducer';
import { ResultTableLoader } from './ResultTableLoader';
import { ExplorerToolbar } from './ExplorerToolbar';

const Explorer = () => {
  const [showFilter, setShowFilter] = useState(false);
  const queryClient = new QueryClient();
  const [filter, setFilter] = useState<FileFilterProps>({});
  const [currentView, setCurrentView] = useState<string>('list');
  const [showRelatedResources] = useState(false);
  const showDrawer = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadataDrawer
  );
  const fileId = useSelector(
    ({ processSlice }: RootState) => processSlice.selectedFileId
  );

  const dispatch = useDispatch();

  const renderView = (view: string) => {
    if (view === 'grid') {
      return (
        <GridTable
          onItemClicked={(item: any) => {
            dispatch(setSelectedFileId(item.id));
            dispatch(showFileMetadataPreview());
          }}
          renderCell={(cellProps: any) => <FileGridPreview {...cellProps} />}
        />
      );
    }
    if (view === 'map') {
      return <MapView />;
    }

    const handleRowSelect = (id: number, selected: boolean) => {
      dispatch(setFileSelectState(id, selected));
    };

    const handleRowClick = (id: number) => {
      dispatch(setSelectedFileId(id));
      dispatch(showFileMetadataPreview());
    };

    return (
      <FileTableExplorer
        onRowSelect={handleRowSelect}
        onRowClick={handleRowClick}
        selectedFileId={fileId}
      />
    );
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
                    onClick={() => setShowFilter(false)}
                  />
                </HideFiltersTooltip>
              </Col>
            </HeaderRow>
            <FiltersContainer>
              <FileFilters filter={filter} setFilter={setFilter} />
            </FiltersContainer>
          </FilterPanel>
        )}

        <TablePanel showDrawer={showDrawer} showFilter={showFilter}>
          {!showFilter ? (
            <div
              style={{
                borderRight: `1px solid ${Colors['greyscale-grey3'].hex()}`,
                padding: '10px',
              }}
            >
              <FilterToggleButton
                toggleOpen={() => setShowFilter(!showFilter)}
              />
            </div>
          ) : undefined}

          <ViewContainer>
            <ExplorerToolbar
              currentView={currentView}
              onViewChange={(view) => setCurrentView(view)}
            />
            <TableContainer>
              <EnsureNonEmptyResource api="file">
                <ResultTableLoader<FileInfo>
                  type="file"
                  mode={showRelatedResources ? 'relatedResources' : 'search'}
                  filter={filter}
                  query=""
                >
                  {(props: TableProps<FileInfo>) => (
                    <ResultAnnotationLoader {...props}>
                      {renderView(currentView)}
                    </ResultAnnotationLoader>
                  )}
                </ResultTableLoader>
              </EnsureNonEmptyResource>
            </TableContainer>
          </ViewContainer>
        </TablePanel>
        {showDrawer && (
          <DrawerContainer>
            <QueryClientProvider client={queryClient}>
              <FileDetails />
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
const TableContainer = styled.div`
  width: 100%;
  overflow: auto;
  height: calc(100% - 104px);
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
