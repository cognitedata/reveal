/* eslint-disable no-alert */

import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import useSelector from 'hooks/useSelector';
import chartsSlice, { chartSelectors, ChartTimeSeries } from 'reducers/charts';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import useDispatch from 'hooks/useDispatch';
import {
  fetchWorkflowsForChart,
  createNewWorkflow,
  deleteWorkflow,
  createWorkflowFromTimeSeries,
} from 'reducers/workflows/api';
import useEnsureData from 'hooks/useEnsureData';
import searchSlice from 'reducers/search';
import { saveExistingChart } from 'reducers/charts/api';
import ChartComponent from 'components/Chart';
import { runWorkflow } from 'reducers/workflows/utils';
import workflowSlice, { Workflow, WorkflowRunStatus } from 'reducers/workflows';
import { NodeProgress } from '@cognite/connect';
import DatePicker from 'react-datepicker';
import {
  Header,
  TopPaneWrapper,
  BottomPaneWrapper,
  ChartViewContainer,
  ToolbarWrapper,
  ContentWrapper,
  ToolbarItem,
  ToolbarIcon,
  ChartContainer,
  SourceListWrapper,
  SourcesTitle,
  SourceList,
  SourceButtonContainer,
  SourceItem,
  SourceCircle,
  SourceSquare,
  ChartWrapper,
  SourceMenu,
  SourceName,
} from './elements';

type ChartViewProps = {
  chartId?: string;
};

const ChartView = ({ chartId: propsChartId }: ChartViewProps) => {
  const hasData = useEnsureData();
  const dispatch = useDispatch();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>();
  const [updateAutomatically, setUpdateAutomatically] = useState<boolean>(
    false
  );
  const { chartId = propsChartId } = useParams<{ chartId: string }>();
  const chart = useSelector((state) =>
    chartSelectors.selectById(state, String(chartId))
  );
  const context = { chart };

  const [workflowsRan, setWorkflowsRan] = useState(false);

  const workflows = useSelector((state) =>
    chart?.workflowCollection?.map(({ id }) => state.workflows.entities[id])
  )?.filter(Boolean) as Workflow[];

  const runWorkflows = async () => {
    (workflows || []).forEach(async (flow) => {
      if (!flow) {
        return;
      }
      let progressTracker = {};
      const nextLatestRun = await runWorkflow(
        flow,
        (nextProgress: NodeProgress) => {
          progressTracker = { ...progressTracker, ...nextProgress };
          dispatch(
            workflowSlice.actions.updateWorkflow({
              id: flow.id,
              changes: {
                latestRun: {
                  status: 'RUNNING',
                  nodeProgress: progressTracker,
                  timestamp: Date.now(),
                },
              },
            })
          );
        },
        context
      );

      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: flow.id,
          changes: {
            latestRun: {
              ...nextLatestRun,
              status: 'SUCCESS',
              nodeProgress: progressTracker,
            },
          },
        })
      );
    });
  };

  useEffect(() => {
    if (chart?.workflowCollection) {
      dispatch(
        fetchWorkflowsForChart(chart?.workflowCollection.map(({ id }) => id))
      );
    }
  }, [chart?.id]);

  useEffect(() => {
    if (chart) {
      dispatch(searchSlice.actions.setActiveChartId(chart.id));
    }
  }, [chart?.id]);

  useEffect(() => {
    if ((workflows || []).length > 0 && !workflowsRan) {
      setWorkflowsRan(true);
      // Run the existing workflows here
      runWorkflows();
    }
  }, [workflows]);

  useEffect(() => {
    if ((workflows || []).length > 0 && updateAutomatically) {
      runWorkflows();
    }
  }, [chart?.dateFrom, chart?.dateTo, updateAutomatically]);

  const onNewWorkflow = () => {
    if (chart) {
      dispatch(createNewWorkflow(chart));
    }
  };

  const handleClickSearch = () => {
    dispatch(searchSlice.actions.showSearch());
  };

  const handleClickSave = async () => {
    if (chart) {
      try {
        await dispatch(saveExistingChart(chart));
        toast.success('Successfully saved nothing!');
      } catch (e) {
        toast.error('Unable to save - try again!');
      }
    }
  };

  const handleToggleAutomaticUpdates = async () => {
    setUpdateAutomatically((val) => !val);
  };

  const handleRemoveTimeSeries = (timeSeriesId: string) => {
    dispatch(
      chartsSlice.actions.removeTimeSeries({
        id: chart?.id || '',
        timeSeriesId,
      })
    );
  };

  const handleToggleTimeSeries = (timeSeriesId: string) => {
    dispatch(
      chartsSlice.actions.toggleTimeSeries({
        id: chart?.id || '',
        timeSeriesId,
      })
    );
  };

  const handleToggleWorkflow = (workflowId: string) => {
    dispatch(
      chartsSlice.actions.toggleWorkflow({
        id: chart?.id || '',
        workflowId,
      })
    );
  };

  const handleRenameTimeSeries = (timeSeriesId: string) => {
    dispatch(
      chartsSlice.actions.renameTimeSeries({
        id: chart?.id || '',
        timeSeriesId,
        name: prompt('Provide new name for time series') || 'unnamed',
      })
    );
  };

  const handleRenameWorkflow = (workflowId: string) => {
    dispatch(
      chartsSlice.actions.renameWorkflow({
        id: chart?.id || '',
        workflowId,
        name: prompt('Provide new name for workflow') || 'unnamed',
      })
    );
  };

  if (!hasData) {
    return <Icon type="Loading" />;
  }

  const handleDateChange = ({
    dateFrom,
    dateTo,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    dispatch(
      chartsSlice.actions.changeDateRange({
        id: chart?.id || '',
        dateFrom,
        dateTo,
      })
    );
  };

  const onDeleteWorkflow = (workflow: Workflow) => {
    if (chart) {
      dispatch(deleteWorkflow(chart, workflow));
    }
  };

  const handleConvertToWorkflow = (id: string) => {
    if (chart) {
      dispatch(createWorkflowFromTimeSeries(chart, id));
    }
  };

  const renderStatusIcon = (status?: WorkflowRunStatus) => {
    switch (status) {
      case 'RUNNING':
        return <Icon type="Loading" />;
      case 'SUCCESS':
        return <Icon type="Check" />;
      case 'FAILED':
        return <Icon type="Close" />;
      default:
        return null;
    }
  };

  if (!chart) {
    return (
      <div>This chart does not seem to exist. You might not have access</div>
    );
  }

  const timeseriesItems = chart.timeSeriesCollection?.map(
    ({ id, name, color, enabled, unit }: ChartTimeSeries) => {
      return (
        <SourceItem key={id}>
          <SourceCircle
            onClick={() => handleToggleTimeSeries(id)}
            color={color}
            fade={!enabled}
          />
          <SourceName title={name}>{name || 'noname'}</SourceName>
          <SourceMenu onClick={(e) => e.stopPropagation()}>
            <Dropdown
              content={
                <Menu>
                  <Menu.Header>
                    <span style={{ wordBreak: 'break-word' }}>{id}</span>
                  </Menu.Header>
                  <Menu.Submenu
                    content={
                      <Menu>
                        <Menu.Header>Select unit</Menu.Header>
                        <Menu.Item>PSI</Menu.Item>
                        <Menu.Item>bar</Menu.Item>
                        <Menu.Item>Pa</Menu.Item>
                      </Menu>
                    }
                  >
                    <span>Unit: {unit}</span>
                  </Menu.Submenu>
                  <Menu.Item
                    onClick={() => handleRenameTimeSeries(id)}
                    appendIcon="Edit"
                  >
                    <span>Rename</span>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => handleRemoveTimeSeries(id)}
                    appendIcon="Delete"
                  >
                    <span>Remove</span>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => handleConvertToWorkflow(id)}
                    appendIcon="Timeseries"
                  >
                    <span>Convert to workflow</span>
                  </Menu.Item>
                </Menu>
              }
            >
              <Icon type="VerticalEllipsis" />
            </Dropdown>
          </SourceMenu>
        </SourceItem>
      );
    }
  );

  const workflowItems = workflows?.map((flow) => {
    const flowEntry = chart?.workflowCollection?.find(
      ({ id }) => id === flow.id
    );

    return (
      <SourceItem key={flow.id} onClick={() => setActiveWorkflowId(flow.id)}>
        <SourceSquare
          onClick={() => handleToggleWorkflow(flow.id)}
          color={flowEntry?.color}
          fade={!flowEntry?.enabled}
        />
        <div style={{ marginRight: 10 }}>
          {renderStatusIcon(flow.latestRun?.status)}
        </div>
        <SourceName>{flowEntry?.name || 'noname'}</SourceName>
        <SourceMenu onClick={(e) => e.stopPropagation()}>
          <Dropdown
            content={
              <Menu>
                <Menu.Header>
                  <span style={{ wordBreak: 'break-word' }}>
                    {flowEntry?.name}
                  </span>
                </Menu.Header>
                <Menu.Item
                  onClick={() => handleRenameWorkflow(flow.id)}
                  appendIcon="Edit"
                >
                  <span>Rename</span>
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    onDeleteWorkflow(flow);
                    if (activeWorkflowId === flow.id) {
                      setActiveWorkflowId(undefined);
                    }
                  }}
                  appendIcon="Delete"
                >
                  <span>Remove</span>
                </Menu.Item>
              </Menu>
            }
          >
            <Icon type="VerticalEllipsis" />
          </Dropdown>
        </SourceMenu>
      </SourceItem>
    );
  });

  return (
    <ChartViewContainer id="chart-view">
      <ContentWrapper>
        <Header>
          <hgroup>
            <h1>{chart?.name}</h1>
            <h4>by {chart?.user}</h4>
          </hgroup>
          <section className="daterange">
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: 10 }}>
                From:{' '}
                <DatePicker
                  selected={new Date(chart.dateFrom || new Date())}
                  onChange={(date: Date) =>
                    handleDateChange({ dateFrom: date })
                  }
                  timeInputLabel="Time:"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  showTimeInput
                />
              </div>
              <div>
                To:{' '}
                <DatePicker
                  selected={new Date(chart.dateTo || new Date())}
                  onChange={(date: Date) => handleDateChange({ dateTo: date })}
                  timeInputLabel="Time:"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  showTimeInput
                />
              </div>
            </div>
          </section>
          <section className="actions">
            <Button
              icon={updateAutomatically ? 'Checkmark' : 'XCompact'}
              type="secondary"
              onClick={() => handleToggleAutomaticUpdates()}
            >
              Automatic Update
            </Button>
            <Button type="secondary" onClick={() => runWorkflows()}>
              Run workflows
            </Button>
            <Button
              icon="Checkmark"
              type="primary"
              onClick={() => handleClickSave()}
            >
              Save
            </Button>
            <Button icon="Share" variant="ghost">
              Share
            </Button>
            <Button icon="Download" variant="ghost">
              Export
            </Button>
          </section>
        </Header>
        <ChartContainer>
          <ToolbarWrapper>
            <ToolbarItem onClick={() => handleClickSearch()}>
              <ToolbarIcon type="Search" />
            </ToolbarItem>
          </ToolbarWrapper>
          <SourceListWrapper>
            <SourcesTitle>Time Series</SourcesTitle>
            <SourceList>
              {timeseriesItems}
              {workflowItems}
            </SourceList>
            <SourceButtonContainer>
              <Button
                onClick={() => onNewWorkflow()}
                icon="Plus"
                iconPlacement="right"
              >
                Create workflow
              </Button>
            </SourceButtonContainer>
          </SourceListWrapper>
          <SplitPaneLayout>
            <TopPaneWrapper className="chart">
              <ChartWrapper>
                <ChartComponent chart={chart} />
              </ChartWrapper>
            </TopPaneWrapper>
            <BottomPaneWrapper className="table">
              <NodeEditor workflowId={activeWorkflowId} chartId={chartId} />
            </BottomPaneWrapper>
          </SplitPaneLayout>
        </ChartContainer>
      </ContentWrapper>
    </ChartViewContainer>
  );
};

export default ChartView;
