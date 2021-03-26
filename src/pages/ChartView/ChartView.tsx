import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import { useHistory, useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import DataQualityReport from 'components/DataQualityReport';
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
import { Chart } from 'reducers/charts/types';
import { getEntryColor } from 'utils/colors';
import { useLoginStatus, useQueryString } from 'hooks';
import { useQueryClient } from 'react-query';
import { duplicate } from 'utils/charts';
import { SEARCH_KEY } from 'utils/constants';
import { Modes } from 'pages/types';
import TimeSeriesRows from './TimeSeriesRows';
import WorkflowRows from './WorkflowRows';
import RunWorkflows from './RunWorkflowsButton';
import {
  BottomPaneWrapper,
  BottombarItem,
  BottombarWrapper,
  ChartContainer,
  ChartViewContainer,
  ChartWrapper,
  ContentWrapper,
  Header,
  SourceItem,
  SourceName,
  SourceTable,
  SourceTableWrapper,
  ToolbarIcon,
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

  const [activeSourceItem, setActiveSourceItem] = useState<string>();

  const [showSearch, setShowSearch] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<Modes>('workspace');
  const isWorkspaceMode = workspaceMode === 'workspace';
  const isDataQualityMode = workspaceMode === 'report';

  /**
   * Open search drawer if query is present in the url
   */
  useEffect(() => {
    if (query !== '' && !showSearch) {
      setShowSearch(true);
    }
  }, [query, showSearch]);

  const [dataQualityReport, setDataQualityReport] = useState<{
    timeSeriesId?: string;
    reportType?: string;
  }>({});

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

  const handleCloseDataQualityReport = () => {
    setDataQualityReport({});
  };

  const handleChangeSourceAxis = debounce(
    ({ x, y }: { x: number[]; y: AxisUpdate[] }) => {
      if (chart) {
        const newChart = {
          ...chart,
        };

        if (x.length === 2) {
          newChart.dateFrom = `${x[0]}`;
          newChart.dateTo = `${x[1]}`;
        }

        if (y.length > 0) {
          y.forEach((update) => {
            newChart.timeSeriesCollection = newChart.timeSeriesCollection?.map(
              (t) => (t.id === update.id ? { ...t, range: update.range } : t)
            );
            newChart.workflowCollection = newChart.workflowCollection?.map(
              (wf) =>
                wf.id === update.id ? { ...wf, range: update.range } : wf
            );
          });
        }

        updateChart(newChart);
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

  const handleOpenSearch = () => {
    setShowSearch(true);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setQuery('');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  };

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
        </>
      )}
      {isDataQualityMode && (
        <>
          <th style={{ width: 200 }}>
            <SourceItem>
              <SourceName>Data Quality Reports</SourceName>
            </SourceItem>
          </th>
          <th>
            <SourceItem>
              <SourceName>Warnings</SourceName>
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
              <RunWorkflows chart={chart} update={updateChart} />
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
          <SplitPaneLayout>
            <TopPaneWrapper className="chart">
              <ChartWrapper>
                <PlotlyChartComponent
                  chart={chart}
                  onAxisChange={(update) => handleChangeSourceAxis(update)}
                  isInSearch={showSearch}
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
                        setDataQualityReport={setDataQualityReport}
                      />
                      <WorkflowRows
                        chart={chart}
                        setActive={setActiveSourceItem}
                        setMode={setWorkspaceMode}
                        updateChart={updateChart}
                        activeWorkflow={activeSourceItem}
                      />
                    </tbody>
                  </SourceTable>
                </SourceTableWrapper>
                {workspaceMode === 'editor' && !!activeSourceItem && (
                  <NodeEditor
                    mutate={mutateAsync}
                    workflowId={activeSourceItem}
                    setWorkspaceMode={setWorkspaceMode}
                    chart={chart}
                  />
                )}
              </div>
            </BottomPaneWrapper>
          </SplitPaneLayout>
        </ChartContainer>
        <BottombarWrapper>
          <BottombarItem
            isActive={workspaceMode === 'workspace'}
            onClick={() => setWorkspaceMode('workspace')}
          >
            <ToolbarIcon type="Timeseries" />
            <span style={{ paddingLeft: 10, paddingRight: 10 }}>Workspace</span>
          </BottombarItem>
          <BottombarItem
            isActive={workspaceMode === 'editor'}
            onClick={() => setWorkspaceMode('editor')}
          >
            <ToolbarIcon type="Edit" />
            <span style={{ paddingLeft: 10, paddingRight: 10 }}>
              Calculations
            </span>
          </BottombarItem>
          <BottombarItem
            isActive={workspaceMode === 'report'}
            onClick={() => setWorkspaceMode('report')}
          >
            <ToolbarIcon type="BarChart" />
            <span style={{ paddingLeft: 10, paddingRight: 10 }}>
              Data Quality Report
            </span>
          </BottombarItem>
        </BottombarWrapper>
        <DataQualityReport
          handleClose={handleCloseDataQualityReport}
          {...dataQualityReport}
        />
      </ContentWrapper>
    </ChartViewContainer>
  );
};

export default ChartView;
