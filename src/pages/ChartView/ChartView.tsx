import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import DataQualityReport from 'components/DataQualityReport';
import PlotlyChartComponent from 'components/PlotlyChart/PlotlyChart';
import DateRangeSelector from 'components/DateRangeSelector';
import { AxisUpdate } from 'components/PlotlyChart';
import Search from 'components/Search';
import { Toolbar } from 'components/Toolbar';
import SharingDropdown from 'components/SharingDropdown/SharingDropdown';
import { charts, useChart, useUpdateChart } from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { Chart, ChartTimeSeries } from 'reducers/charts/types';
import { getEntryColor } from 'utils/colors';
import { useLoginStatus } from 'hooks';
import { useQueryClient } from 'react-query';
import TimeSeriesRow from './TimeSeriesRow';
import WorkflowRow from './WorkflowRow';
import RunWorkflows from './RunWorkflowsButton';
import {
  Header,
  TopPaneWrapper,
  BottomPaneWrapper,
  ChartViewContainer,
  ContentWrapper,
  BottombarWrapper,
  BottombarItem,
  ToolbarIcon,
  ChartContainer,
  SourceItem,
  ChartWrapper,
  SourceName,
  SourceTableWrapper,
  SourceTable,
  ChartTitle,
} from './elements';

type ChartViewProps = {
  chartId: string;
};

const ChartView = ({ chartId: chartIdProp }: ChartViewProps) => {
  const cache = useQueryClient();
  const { data } = useLoginStatus();
  const { chartId = chartIdProp } = useParams<{ chartId: string }>();
  const { data: chart, isError, isFetched } = useChart(chartId);
  const {
    mutate,
    isLoading: isUpdating,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();
  const updateChart = (updatedChart: Chart) =>
    mutate({
      chart: updatedChart,
      skipPersist: data?.user !== updatedChart.user,
    });

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!');
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2));
    }
  }, [updateError, updateError]);

  useEffect(() => {
    const doc = charts().doc(chartId);
    return doc.onSnapshot({
      next(snap) {
        cache.setQueryData(['chart', chartId], snap.data());
      },
    });
  }, [charts, chartId]);

  const [activeSourceItem, setActiveSourceItem] = useState<string>();
  const [updateAutomatically, setUpdateAutomatically] = useState<boolean>(true);

  const [showSearch, setShowSearch] = useState(false);

  const [workspaceMode, setWorkspaceMode] = useState<string>('workspace');
  const isWorkspaceMode = workspaceMode === 'workspace';
  const isEditorMode = workspaceMode === 'editor';
  const isDataQualityMode = workspaceMode === 'report';

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

  const handleToggleAutomaticUpdates = async () => {
    setUpdateAutomatically((val) => !val);
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
        const newChart = { ...chart };
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

  const handleDuplicateChart = async () => {
    if (chart) {
      const newChart = {
        ...chart,
        name: `${chart.name} Copy`,
        id: nanoid(),
      };
      updateChart(newChart);
    }
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
          onSearchClick={() => setShowSearch(true)}
          onNewWorkflowClick={handleClickNewWorkflow}
        />
      )}
      <Search visible={showSearch} onClose={() => setShowSearch(false)} />
      <ContentWrapper showSearch={showSearch}>
        <Header>
          <hgroup>
            <ChartTitle
              onClick={() => {
                if (chart) {
                  // eslint-disable-next-line no-alert
                  const name = prompt('Rename chart', chart.name) || chart.name;
                  updateChart({ ...chart, name });
                }
              }}
            >
              {chart?.name}{' '}
              {isUpdating && (
                <Icon
                  style={{ color: 'var(--cogs-greyscale-grey5)' }}
                  type="Loading"
                />
              )}
              <span>
                <Icon type="Edit" />
              </span>
            </ChartTitle>
            <h4>by {chart?.user}</h4>
          </hgroup>
          <section className="daterange">
            <DateRangeSelector chart={chart} />
          </section>
          {!showSearch && (
            <section className="actions">
              <Button
                icon={updateAutomatically ? 'Checkmark' : 'XCompact'}
                type="secondary"
                onClick={() => handleToggleAutomaticUpdates()}
              >
                Automatic Update
              </Button>
              <RunWorkflows chart={chart} update={updateChart} />
              <SharingDropdown chart={chart} />
              <Button icon="Download" variant="ghost">
                Export
              </Button>
              <Dropdown
                content={
                  <Menu>
                    <Menu.Item onClick={() => handleDuplicateChart()}>
                      <Icon type="Duplicate" />
                      <span>Duplicate</span>
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
                  showYAxis={!showSearch}
                />
              </ChartWrapper>
            </TopPaneWrapper>
            <BottomPaneWrapper className="table">
              <div style={{ display: 'flex', height: '100%' }}>
                <SourceTableWrapper>
                  <SourceTable>
                    <thead>{sourceTableHeaderRow}</thead>
                    <tbody>
                      {chart.timeSeriesCollection?.map((t: ChartTimeSeries) => (
                        <TimeSeriesRow
                          mutate={updateChart}
                          chart={chart}
                          timeseries={t}
                          setDataQualityReport={setDataQualityReport}
                          active={false}
                          disabled={isEditorMode}
                          isDataQualityMode={isDataQualityMode}
                          isWorkspaceMode={isWorkspaceMode}
                          key={t.id}
                        />
                      ))}
                      {chart?.workflowCollection?.map((flow) => (
                        <WorkflowRow
                          mutate={updateChart}
                          chart={chart}
                          workflow={flow}
                          isActive={activeSourceItem === flow.id}
                          setActiveSourceItem={setActiveSourceItem}
                          key={flow.id}
                          isDataQualityMode={isDataQualityMode}
                          isWorkspaceMode={isWorkspaceMode}
                        />
                      ))}
                    </tbody>
                  </SourceTable>
                </SourceTableWrapper>
                {workspaceMode === 'editor' && !!activeSourceItem && (
                  <NodeEditor
                    mutate={mutate}
                    workflowId={activeSourceItem}
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
