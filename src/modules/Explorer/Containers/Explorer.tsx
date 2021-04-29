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
import { setFileSelectState } from 'src/modules/Upload/uploadedFilesSlice';
import { useDispatch } from 'react-redux';
import { FileTableExplorer } from 'src/modules/Common/Components/FileTable/FileTableExplorer';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { ResultTableLoader } from './ResultTableLoader';
import { ExplorerToolbar } from './ExplorerToolbar';

const Explorer = () => {
  const [showFilter, setShowFilter] = useState(false);
  const queryClient = new QueryClient();
  const active = false;

  const [filter, setFilter] = useState<FileFilterProps>({});
  const [currentView, setCurrentView] = useState<string>('list');
  const [showRelatedResources] = useState(false);
  const dispatch = useDispatch();

  const renderView = (view: string) => {
    if (view === 'grid') {
      return (
        <GridTable
          onItemClicked={() => {}}
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

    return <FileTableExplorer onRowSelect={handleRowSelect} />;
  };
  return (
    <Wrapper>
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            display: 'flex',
            flex: '0 1 auto',
            flexDirection: 'column',
            width: showFilter ? 318 : 0,
            borderRight: `1px solid ${lightGrey}`,
            visibility: showFilter ? 'visible' : 'hidden',
          }}
        >
          {showFilter && (
            <>
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
            </>
          )}
        </div>

        <div
          style={{
            width: active ? 440 : 'calc(100% - 318px)',
            flex: active ? 'unset' : 1,
            borderRight: `1px solid ${Colors['greyscale-grey3'].hex()}`,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
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
          </ViewContainer>
        </div>
      </QueryClientProvider>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 56px);
  background: #fff;
  overflow: hidden;
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

export default Explorer;
