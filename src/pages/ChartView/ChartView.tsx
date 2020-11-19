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
} from 'reducers/workflows/api';
import useEnsureData from 'hooks/useEnsureData';
import { Header, TopPaneWrapper, BottomPaneWrapper } from './elements';

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
  const workflows = useSelector((state) =>
    chart?.workflowIds?.map((id) => state.workflows.entities[id])
  )?.filter(Boolean);

  useEffect(() => {
    if (chart?.workflowIds) {
      dispatch(fetchWorkflowsForChart(chart?.workflowIds));
      // Run the existing workflows here
    }
  }, [chart?.id]);

  const onNewWorkflow = () => {
    if (chart) {
      dispatch(createNewWorkflow(chart));
    }
  };

  const dataFromWorkflows = workflows
    ?.filter((workflow) => workflow?.latestRun?.status === 'SUCCESS')
    .map((workflow) => ({
      name: workflow?.name,
      data: workflow?.latestRun?.results,
    }));

  if (!hasData) {
    return <Icon type="Loading" />;
  }

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
              Chart would go here.
              {dataFromWorkflows && (
                <div>
                  Data from workflow: {JSON.stringify(dataFromWorkflows)}
                </div>
              )}
              <Dropdown
                content={
                  <Menu>
                    {chart.workflowIds?.map((id) => (
                      <Menu.Item
                        key={id}
                        onClick={() => setActiveWorkflowId(id)}
                      >
                        {id}
                      </Menu.Item>
                    ))}
                    <Menu.Divider />
                    <Menu.Item onClick={onNewWorkflow}>Create new</Menu.Item>
                  </Menu>
                }
              >
                <Button>{activeWorkflowId || 'Select a workflow'}</Button>
              </Dropdown>
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
