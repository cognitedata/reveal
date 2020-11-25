import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import useSelector from 'hooks/useSelector';
import chartsSlice, {
  Chart,
  chartSelectors,
  ChartTimeSeries,
} from 'reducers/charts';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import useDispatch from 'hooks/useDispatch';
import {
  fetchWorkflowsForChart,
  createNewWorkflow,
} from 'reducers/workflows/api';
import useEnsureData from 'hooks/useEnsureData';
import searchSlice from 'reducers/search';
import collectionsSlice from 'reducers/collections';
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
  ChartWrapper,
} from './elements';

type ChartViewProps = {
  chartId?: string;
};

const ChartView = ({ chartId: propsChartId }: ChartViewProps) => {
  const hasData = useEnsureData();
  const dispatch = useDispatch();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>();
  const { chartId = propsChartId } = useParams<{ chartId: string }>();
  const chart = useSelector((state) =>
    chartSelectors.selectById(state, String(chartId))
  );
  const [workflowsRan, setWorkflowsRan] = useState(false);

  const workflows = useSelector((state) =>
    chart?.workflowIds?.map((id) => state.workflows.entities[id])
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
        }
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
    if (chart?.workflowIds) {
      dispatch(fetchWorkflowsForChart(chart?.workflowIds));
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

  const onNewWorkflow = () => {
    if (chart) {
      dispatch(createNewWorkflow(chart));
    }
  };

  const handleClickSearch = () => {
    dispatch(searchSlice.actions.showSearch());
  };

  const handleClickCollections = () => {
    dispatch(collectionsSlice.actions.showCollections());
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
    ({ id, color }: ChartTimeSeries) => {
      return (
        <SourceItem>
          <SourceCircle color={color} />
          {id}
        </SourceItem>
      );
    }
  );

  const workflowItems = workflows?.map((flow) => {
    return (
      <SourceItem onClick={() => setActiveWorkflowId(flow.id)}>
        <SourceCircle />
        {flow.name || 'noname'}
        <div style={{ marginRight: 10 }}>
          {renderStatusIcon(flow.latestRun?.status)}
        </div>
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
            <ToolbarItem onClick={() => handleClickCollections()}>
              <ToolbarIcon type="Folder" />
            </ToolbarItem>
          </ToolbarWrapper>
          <SourceListWrapper>
            <SourcesTitle>Time Series</SourcesTitle>
            <SourceList>{timeseriesItems}</SourceList>
            <SourceButtonContainer>
              <Button
                onClick={() => handleClickSearch()}
                icon="Plus"
                iconPlacement="right"
              >
                Add
              </Button>
            </SourceButtonContainer>
            <SourcesTitle>Workflows</SourcesTitle>
            <SourceList>{workflowItems}</SourceList>
            <SourceButtonContainer>
              <Button
                onClick={() => onNewWorkflow()}
                icon="Plus"
                iconPlacement="right"
              >
                Create
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
              <NodeEditor workflowId={activeWorkflowId} />
            </BottomPaneWrapper>
          </SplitPaneLayout>
        </ChartContainer>
      </ContentWrapper>
    </ChartViewContainer>
  );
};

export default ChartView;
