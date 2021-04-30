import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { Button, Icon, toast, Tooltip } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChart';
import DateRangeSelector from 'components/DateRangeSelector';
import Search from 'components/Search';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import { getEntryColor } from 'utils/colors';
import { useQueryString } from 'hooks';
import { SEARCH_KEY } from 'utils/constants';
import { Modes } from 'pages/types';
import DetailsSidebar from 'components/DetailsSidebar';
import TimeSeriesRows from './TimeSeriesRows';
import WorkflowRows from './WorkflowRows';

import {
  BottomPaneWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  Header,
  SourceItem,
  SourceName,
  SourceTable,
  SourceTableWrapper,
  TopPaneWrapper,
} from './elements';

type ChartViewProps = {
  chartId: string;
};

const ChartView = ({ chartId: chartIdProp }: ChartViewProps) => {
  const { item: query, setItem: setQuery } = useQueryString(SEARCH_KEY);

  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
  const { data: chart, isError, isFetched } = useChart(chartId);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const {
    mutate: updateChart,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!');
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2));
    }
  }, [updateError, updateErrorMsg]);

  const [selectedSourceId, setSelectedSourceId] = useState<
    string | undefined
  >();

  const [showSearch, setShowSearch] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<Modes>('workspace');
  const [stackedMode, setStackedMode] = useState<boolean>(false);
  const isWorkspaceMode = workspaceMode === 'workspace';

  /**
   * Open search drawer if query is present in the url
   */
  useEffect(() => {
    if (query !== '' && !showSearch) {
      setShowSearch(true);
    }
  }, [query, showSearch]);

  const handleClickNewWorkflow = () => {
    if (chart) {
      updateChart({
        ...chart,
        workflowCollection: [
          ...(chart.workflowCollection || []),
          {
            id: nanoid(),
            name: 'New Calculation',
            color: getEntryColor(),
            lineWeight: 1,
            lineStyle: 'solid',
            enabled: true,
            nodes: [],
            connections: [],
          },
        ],
      });
    }
  };

  if (!isFetched) {
    return <Icon type="Loading" />;
  }

  if (isError) {
    return (
      <div>
        <p>Could not load chart</p>
      </div>
    );
  }

  if (!chart) {
    return (
      <div>This chart does not seem to exist. You might not have access</div>
    );
  }

  const handleSourceClick = async (sourceId?: string) => {
    setSelectedSourceId(sourceId);
  };

  const handleInfoClick = async (sourceId?: string) => {
    const isSameSource = sourceId === selectedSourceId;
    const showMenu = isSameSource ? !showContextMenu : true;
    setShowContextMenu(showMenu);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const handleCloseContextMenu = async () => {
    setShowContextMenu(false);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const handleOpenSearch = async () => {
    setShowSearch(true);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const handleCloseSearch = async () => {
    setShowSearch(false);
    setQuery('');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const selectedSourceItem = [
    ...(chart.timeSeriesCollection || []).map(
      (ts) =>
        ({
          type: 'timeseries',
          ...ts,
        } as ChartTimeSeries)
    ),
    ...(chart.workflowCollection || []).map(
      (wf) =>
        ({
          type: 'workflow',
          ...wf,
        } as ChartWorkflow)
    ),
  ].find(({ id }) => id === selectedSourceId);

  const sourceTableHeaderRow = (
    <tr>
      <th style={{ width: 350 }}>
        <SourceItem>
          <SourceName>
            <Icon
              type="Eye"
              style={{
                marginLeft: 7,
                marginRight: 20,
                verticalAlign: 'middle',
              }}
            />
            Name
          </SourceName>
        </SourceItem>
      </th>
      {isWorkspaceMode && (
        <>
          <th>
            <SourceItem>
              <SourceName>Description</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 210 }}>
            <SourceItem>
              <SourceName>Tag</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 60 }}>
            <SourceItem>
              <SourceName>Min</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 60 }}>
            <SourceItem>
              <SourceName>Max</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 60 }}>
            <SourceItem>
              <SourceName>Median</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 180, paddingRight: 8 }}>
            <SourceItem style={{ justifyContent: 'flex-end' }}>
              <SourceName>Unit</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 50, paddingLeft: 0 }}>
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>P&amp;IDs</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 50, paddingLeft: 0 }}>
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>Style</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 50, paddingLeft: 0 }}>
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>Remove</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 50, paddingLeft: 0 }}>
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>Details</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 50, paddingLeft: 0 }}>
            <SourceItem style={{ justifyContent: 'center' }}>
              <SourceName>More</SourceName>
            </SourceItem>
          </th>
        </>
      )}
    </tr>
  );

  return (
    <ChartViewContainer id="chart-view">
      {showSearch && (
        <Search visible={showSearch} onClose={handleCloseSearch} />
      )}
      <ContentWrapper showSearch={showSearch}>
        <Header inSearch={showSearch}>
          {!showSearch && (
            <section className="actions">
              <Button icon="Plus" type="primary" onClick={handleOpenSearch}>
                Add time series
              </Button>
              <Button
                icon="YAxis"
                variant="ghost"
                onClick={handleClickNewWorkflow}
              >
                Add calculation
              </Button>
            </section>
          )}
          <section className="daterange">
            <Tooltip content={`${stackedMode ? 'Disable' : 'Enable'} stacking`}>
              <Button
                icon="ChartStackedView"
                variant={stackedMode ? 'default' : 'ghost'}
                onClick={() => setStackedMode(!stackedMode)}
              />
            </Tooltip>
            <Divider />
            <DateRangeSelector chart={chart} />
          </section>
        </Header>
        <ChartContainer>
          <SplitPaneLayout defaultSize={200}>
            <TopPaneWrapper className="chart">
              <ChartWrapper>
                <PlotlyChartComponent
                  key={chartId}
                  chartId={chartId}
                  isInSearch={showSearch}
                  stackedMode={stackedMode}
                />
              </ChartWrapper>
            </TopPaneWrapper>
            <BottomPaneWrapper className="table">
              <div style={{ display: 'flex', height: '100%' }}>
                <SourceTableWrapper>
                  <SourceTable>
                    <thead>{sourceTableHeaderRow}</thead>
                    <tbody>
                      <TimeSeriesRows
                        chart={chart}
                        updateChart={updateChart}
                        mode={workspaceMode}
                        selectedSourceId={selectedSourceId}
                        onRowClick={handleSourceClick}
                        onInfoClick={handleInfoClick}
                      />

                      <WorkflowRows
                        chart={chart}
                        updateChart={updateChart}
                        mode={workspaceMode}
                        setMode={setWorkspaceMode}
                        selectedSourceId={selectedSourceId}
                        onRowClick={handleSourceClick}
                        onInfoClick={handleInfoClick}
                      />
                    </tbody>
                  </SourceTable>
                </SourceTableWrapper>
                {workspaceMode === 'editor' && !!selectedSourceId && (
                  <NodeEditor
                    mutate={updateChart}
                    workflowId={selectedSourceId}
                    setWorkspaceMode={setWorkspaceMode}
                    chart={chart}
                  />
                )}
              </div>
            </BottomPaneWrapper>
          </SplitPaneLayout>
        </ChartContainer>
      </ContentWrapper>
      <DetailsSidebar
        chart={chart}
        visible={showContextMenu}
        onClose={handleCloseContextMenu}
        sourceItem={selectedSourceItem}
      />
    </ChartViewContainer>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin-left: 10px;
`;

export default ChartView;
