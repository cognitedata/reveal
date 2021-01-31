import React, { useState } from 'react';
import styled from 'styled-components/macro';
import {
  SourceNode,
  ControllerProvider,
  Node,
  Connection,
  NodeContainer,
} from '@cognite/connect';
import { Menu, Input, Button } from '@cognite/cogs.js';
import { nanoid } from 'nanoid';
import workflowBackgroundSrc from 'assets/workflowBackground.png';
import useSelector from 'hooks/useSelector';
import workflowSlice, {
  LatestWorkflowRun,
  StorableNode,
  workflowSelectors,
} from 'reducers/workflows';
import useDispatch from 'hooks/useDispatch';
import { saveExistingWorkflow } from 'reducers/workflows/api';
import { chartSelectors } from 'reducers/charts';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';
import sdk from 'services/CogniteSDK';
import { CogniteFunction } from 'reducers/workflows/Nodes/DSPToolboxFunction';
import { waitOnFunctionComplete } from 'utils/cogniteFunctions';
import { pinTypes, isWorkflowRunnable } from './utils';
import defaultNodeOptions from '../../reducers/workflows/Nodes';
import ConfigPanel from './ConfigPanel';

const WorkflowContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  flex-grow: 9;

  .node-container {
    background: url(${workflowBackgroundSrc}) #404040;
  }
`;

type WorkflowEditorProps = {
  workflowId?: string;
  chartId?: string;
};

const WorkflowEditor = ({ workflowId, chartId }: WorkflowEditorProps) => {
  const dispatch = useDispatch();
  const [activeNode, setActiveNode] = useState<StorableNode>();

  const tenant = useSelector((state) => state.environment.tenant);

  const workflow = useSelector((state) =>
    workflowSelectors.selectById(state, workflowId || '')
  );
  const { nodes = [], connections = [] } = workflow || {};

  const chart = useSelector((state) =>
    chartSelectors.selectById(state, chartId || '')
  )!;
  const context = { chart };

  const setConnections = (nextConnections: Record<string, Connection>) => {
    if (workflowId) {
      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: workflowId,
          changes: { connections: nextConnections },
        })
      );
    }
  };

  const setNodes = (nextNodes: StorableNode[]) => {
    if (workflowId) {
      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: workflowId,
          changes: { nodes: nextNodes },
        })
      );
    }
  };

  const onUpdateNode = (nextNode: Node) => {
    setNodes(nodes.map((node) => (node.id === nextNode.id ? nextNode : node)));
    // Our nodes have been updated - clear out the statuses for our last run
    if (workflow?.latestRun) {
      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: workflow.id,
          changes: {
            latestRun: {
              ...workflow.latestRun,
              nodeProgress: undefined,
            },
          },
        })
      );
    }
  };

  const onNewNode = (newNode: Node) => {
    setNodes([...nodes, newNode]);
  };

  const onRemoveNode = (node: Node) => {
    const newConnections = { ...connections };
    Object.values(newConnections).forEach((conn) => {
      if (
        conn.inputPin.nodeId === node.id ||
        conn.outputPin.nodeId === node.id
      ) {
        delete newConnections[conn.id];
      }
    });
    setNodes([...nodes].filter((n) => n.id !== node.id));
    setConnections(newConnections);
  };

  const onSave = async () => {
    if (workflow) {
      dispatch(saveExistingWorkflow(workflow));
    }
  };

  const onRun = async () => {
    if (!workflow) {
      return;
    }

    if (!tenant) {
      return;
    }

    const steps = getStepsFromWorkflow(workflow);
    // console.log('Running workflow');

    if (!steps.length) {
      return;
    }

    const computation = {
      steps,
      start_time: new Date(chart.dateFrom).getTime(),
      end_time: new Date(chart.dateTo).getTime(),
      granularity: calculateGranularity(
        [new Date(chart.dateFrom).getTime(), new Date(chart.dateTo).getTime()],
        1000
      ),
    };

    // console.log({ computation });

    const functions = await sdk.get<{ items: CogniteFunction[] }>(
      `https://api.cognitedata.com/api/playground/projects/${tenant}/functions`
    );

    const simpleCalc = functions.data.items.find(
      (func) => func.name === 'simple_calc-master'
    );

    if (!simpleCalc) {
      return;
    }

    dispatch(
      workflowSlice.actions.updateWorkflow({
        id: workflow.id,
        changes: {
          latestRun: {
            timestamp: Date.now(),
            status: 'RUNNING',
            nodeProgress: workflow.nodes.reduce((output, node) => {
              return {
                ...output,
                [node.id]: { status: 'RUNNING' },
              };
            }, {}),
          },
        },
      })
    );

    const functionCall = await sdk.post<{ id: number }>(
      `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/call`,
      {
        data: {
          data: { computation_graph: computation },
        },
      }
    );

    await waitOnFunctionComplete(tenant, simpleCalc.id, functionCall.data.id);

    const functionResult = await sdk.get<{ response: Record<string, any> }>(
      `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/calls/${functionCall.data.id}/response`
    );

    // console.log({
    //   status,
    //   result: functionResult.data,
    // });

    if (functionResult.data.response.error) {
      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: workflow.id,
          changes: {
            latestRun: {
              timestamp: Date.now(),
              status: 'FAILED',
              nodeProgress: workflow.nodes.reduce((output, node) => {
                return {
                  ...output,
                  [node.id]: { status: 'FAILED' },
                };
              }, {}),
            },
          },
        })
      );

      return;
    }

    const latestRun: LatestWorkflowRun = {
      status: 'SUCCESS',
      timestamp: Date.now(),
      errors: [],
      results: {
        datapoints: {
          unit: 'Unknown',
          datapoints: functionResult.data.response.value.map(
            (_: any, i: number) => ({
              timestamp: functionResult.data.response.timestamp[i],
              value: functionResult.data.response.value[i],
            })
          ),
        },
      },
      nodeProgress: workflow.nodes.reduce((output, node) => {
        return {
          ...output,
          [node.id]: { status: 'DONE' },
        };
      }, {}),
    };

    dispatch(
      workflowSlice.actions.updateWorkflow({
        id: workflow.id,
        changes: {
          latestRun,
        },
      })
    );
  };

  if (!workflowId) {
    return null;
  }

  if (!workflow) {
    return null;
  }

  return (
    <WorkflowContainer>
      <ControllerProvider
        pinTypes={pinTypes}
        connections={connections}
        onConnectionsUpdate={setConnections}
      >
        <NodeContainer
          contextMenu={(
            onClose: Function,
            nodePosition: { x: number; y: number }
          ) => (
            <Menu>
              <Menu.Item>
                <Input />
              </Menu.Item>
              {Object.values(defaultNodeOptions).map((nodeOption) => (
                <Menu.Item
                  onClick={() => {
                    onNewNode({
                      id: `${nodeOption.node.subtitle}-${nanoid()}`,
                      ...nodeOption.node,
                      ...nodePosition,
                    });
                    onClose();
                  }}
                >
                  {nodeOption.name}
                </Menu.Item>
              ))}
            </Menu>
          )}
        >
          {nodes.map((node) => (
            <SourceNode
              node={{ ...node, selected: node.id === activeNode?.id }}
              status={workflow.latestRun?.nodeProgress?.[node.id]}
              onUpdate={onUpdateNode}
              onClick={(clickedNode: Node) => {
                setActiveNode(clickedNode);
              }}
            />
          ))}
        </NodeContainer>
      </ControllerProvider>

      {activeNode && (
        <ConfigPanel
          node={activeNode}
          onSave={onUpdateNode}
          onClose={() => setActiveNode(undefined)}
          onRemove={() => {
            onRemoveNode(activeNode);
            setActiveNode(undefined);
          }}
          context={context}
        />
      )}

      <Button
        type="primary"
        style={{ position: 'absolute', top: 16, right: 16 }}
        onClick={onSave}
      >
        Save
      </Button>

      <Button
        type="primary"
        style={{ position: 'absolute', bottom: 16, right: 16 }}
        disabled={!isWorkflowRunnable(nodes || [])}
        onClick={onRun}
      >
        Run
      </Button>
    </WorkflowContainer>
  );
};

export default WorkflowEditor;
