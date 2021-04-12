import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import { useHistory, useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChart';
import DateRangeSelector from 'components/DateRangeSelector';
import { AxisUpdate } from 'components/PlotlyChart';
import Search from 'components/Search';
import { Toolbar } from 'components/Toolbar';
import SharingDropdown from 'components/SharingDropdown/SharingDropdown';
import EditableText from 'components/EditableText';
import {
  charts,
  useChart,
  useUpdateChart,
  useDeleteChart,
} from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import { getEntryColor } from 'utils/colors';
import { useLoginStatus, useQueryString } from 'hooks';
import { useQueryClient } from 'react-query';
import { duplicate, updateSourceAxisForChart } from 'utils/charts';
import { SEARCH_KEY } from 'utils/constants';
import { Modes } from 'pages/types';
import { ContextMenu } from 'components/ContextMenu';
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
  const history = useHistory();
  const { item: query, setItem: setQuery } = useQueryString(SEARCH_KEY);

  const cache = useQueryClient();
  const { data: login } = useLoginStatus();

  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
  const { data: chart, isError, isFetched } = useChart(chartId);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const {
    mutateAsync,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  const updateChart = (updatedChart: Chart) =>
    mutateAsync({
      chart: updatedChart,
      skipPersist: login?.user !== updatedChart.user,
    });

  const { mutate: deleteChart } = useDeleteChart();

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!');
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2));
    }
  }, [updateError, updateErrorMsg]);

  useEffect(() => {
    const doc = charts().doc(chartId);
    return doc.onSnapshot({
      next(snap) {
        const key = ['chart', chartId];
        const newChart = snap.data() as Chart;
        const cacheChart = cache.getQueryData<Chart>(key);
        if (cacheChart?.dirty && newChart.user !== login?.user) {
          toast.warn('Chart have been changed by owner');
        } else {
          cache.setQueryData(key, newChart);
        }
      },
    });
  }, [chartId, login, cache]);

  const [selectedSourceId, setSelectedSourceId] = useState<
    string | undefined
  >();

  const [showSearch, setShowSearch] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<Modes>('workspace');
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
            lineWeight: 2,
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

  const handleChangeSourceAxis = debounce(
    ({ x, y }: { x: string[]; y: AxisUpdate[] }) => {
      if (chart) {
        const updatedChart = updateSourceAxisForChart(chart, { x, y });
        updateChart(updatedChart);
      }
    },
    500
  );

  const onDeleteSuccess = () => {
    history.push('/');
  };

  const onDeleteError = () => {
    toast.error('There was a problem deleting the chart. Try again!');
  };

  const handleDeleteChart = async () => {
    deleteChart(chart.id, {
      onSuccess: onDeleteSuccess,
      onError: onDeleteError,
    });
  };

  const handleDuplicateChart = async () => {
    if (login?.user) {
      const newChart = duplicate(chart, login.user);
      await updateChart(newChart);
      history.push(`/${newChart.id}`);
    }
  };

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
          <SourceName>Name</SourceName>
        </SourceItem>
      </th>
      {isWorkspaceMode && (
        <>
          <th style={{ width: 110 }}>
            <SourceItem>
              <SourceName>Unit (input)</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 110 }}>
            <SourceItem>
              <SourceName>Unit (output)</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 300 }}>
            <SourceItem>
              <SourceName>Source</SourceName>
            </SourceItem>
          </th>
          <th>
            <SourceItem>
              <SourceName>Description</SourceName>
            </SourceItem>
          </th>
          <th style={{ width: 100 }}>
            <SourceItem>
              <SourceName>P&amp;IDs</SourceName>
            </SourceItem>
          </th>
          <th>
            <SourceItem>
              <SourceName>Details</SourceName>
            </SourceItem>
          </th>
          <th>
            <SourceItem>
              <SourceName>Edit</SourceName>
            </SourceItem>
          </th>
        </>
      )}
    </tr>
  );

  return (
    <ChartViewContainer id="chart-view">
      {!showSearch && (
        <Toolbar
          onSearchClick={handleOpenSearch}
          onNewWorkflowClick={handleClickNewWorkflow}
        />
      )}
      {showSearch && (
        <Search visible={showSearch} onClose={handleCloseSearch} />
      )}
      <ContentWrapper showSearch={showSearch}>
        <Header>
          <hgroup>
            <h1>
              <EditableText
                value={chart.name}
                onChange={(value) => {
                  if (chart) {
                    updateChart({ ...chart, name: value });
                  }
                }}
              />
            </h1>
            <h4>by {chart?.user}</h4>
          </hgroup>
          <section className="daterange">
            <DateRangeSelector chart={chart} />
          </section>
          {!showSearch && (
            <section className="actions">
              <SharingDropdown chart={chart} />
              <Dropdown
                content={
                  <Menu>
                    <Menu.Item onClick={() => handleDuplicateChart()}>
                      <Icon type="Duplicate" />
                      <span>Duplicate</span>
                    </Menu.Item>
                    {login?.user === chart.user && (
                      <Menu.Item onClick={() => handleDeleteChart()}>
                        <Icon type="Delete" />
                        <span>Delete</span>
                      </Menu.Item>
                    )}
                    <Menu.Item disabled>
                      {/* disabled doesn't change the color */}
                      <span style={{ color: 'var(--cogs-greyscale-grey5)' }}>
                        <Icon type="Download" />
                        Export
                      </span>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon="Down" iconPlacement="right">
                  Actions
                </Button>
              </Dropdown>
            </section>
          )}
        </Header>
        <ChartContainer>
          <SplitPaneLayout defaultSize={200}>
            <TopPaneWrapper className="chart">
              <ChartWrapper>
                <PlotlyChartComponent
                  chart={chart}
                  onAxisChange={(update) => handleChangeSourceAxis(update)}
                  isInSearch={showSearch}
                  cacheTimeseries
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
                    mutate={mutateAsync}
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
      <ContextMenu
        chart={chart}
        visible={showContextMenu}
        onClose={handleCloseContextMenu}
        sourceItem={selectedSourceItem}
      />
    </ChartViewContainer>
  );
};

export default ChartView;
