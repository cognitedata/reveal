import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Icon, Menu, toast } from '@cognite/cogs.js';
import useSelector from 'hooks/useSelector';
import { chartSelectors } from 'reducers/charts';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import useDispatch from 'hooks/useDispatch';
import {
  fetchWorkflowsForChart,
  createNewWorkflow,
  deleteWorkflow,
} from 'reducers/workflows/api';
import { runWorkflow } from 'reducers/workflows/utils';
import workflowSlice, { Workflow, WorkflowRunStatus } from 'reducers/workflows';
import { NodeProgress } from '@cognite/connect';
import { Header, TopPaneWrapper, BottomPaneWrapper } from './elements';

type ChartViewProps = {
  chartId?: string;
};

const ChartView = ({ chartId: propsChartId }: ChartViewProps) => {
  const dispatch = useDispatch();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>();
  const { chartId = propsChartId } = useParams<{ chartId: string }>();
  const chart = useSelector((state) =>
    chartSelectors.selectById(state, String(chartId))
  );
  const [workflowsRan, setWorkflowsRan] = useState(false);
  const workflows = useSelector((state) =>
    chart?.workflowIds?.map((id) => state.workflows.entities[id])
  )?.filter(Boolean);

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
  }, []);

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

  const onDeleteWorkflow = (workflow: Workflow) => {
    if (chart) {
      dispatch(deleteWorkflow(chart, workflow));
    }
  };

  const dataFromWorkflows = workflows
    ?.filter((workflow) => workflow?.latestRun?.status === 'SUCCESS')
    .map((workflow) => ({
      name: workflow?.name,
      data: workflow?.latestRun?.results,
    }));

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

  return (
    <div id="chart-view">
      <Header>
        <hgroup>
          <h1>{chart?.name}</h1>
          <h4>by Anon User</h4>
        </hgroup>
        <section className="actions">
          <Button
            icon="Checkmark"
            type="primary"
            onClick={() => {
              toast.success('Successfully saved nothing!');
            }}
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
      <div style={{ height: '100%' }}>
        <SplitPaneLayout>
          <TopPaneWrapper className="chart">
            <div
              style={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>Chart would go here.</div>
              {dataFromWorkflows && (
                <div>
                  Data from workflow:{' '}
                  {dataFromWorkflows.map((data) => (
                    <div>
                      {data.name}: {data.data?.datapoints?.length} datapoints
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Dropdown
                  content={
                    <Menu>
                      {(workflows || []).map(
                        (flow) =>
                          flow && (
                            <Menu.Item
                              key={flow.id}
                              onClick={() => setActiveWorkflowId(flow.id)}
                            >
                              {activeWorkflowId === flow.id ? '!' : ''}
                              {renderStatusIcon(flow.latestRun?.status)}
                              {flow.name || 'noname'}{' '}
                              <Button
                                unstyled
                                icon="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteWorkflow(flow);
                                  if (activeWorkflowId === flow.id) {
                                    setActiveWorkflowId(undefined);
                                  }
                                }}
                              />
                            </Menu.Item>
                          )
                      )}
                      <Menu.Divider />
                      <Menu.Item onClick={onNewWorkflow}>Create new</Menu.Item>
                    </Menu>
                  }
                >
                  <Button>{activeWorkflowId || 'Select a workflow'}</Button>
                </Dropdown>
              </div>
            </div>
          </TopPaneWrapper>
          <BottomPaneWrapper className="table">
            <NodeEditor workflowId={activeWorkflowId} />
          </BottomPaneWrapper>
        </SplitPaneLayout>
      </div>
    </div>
  );
};

export default ChartView;
