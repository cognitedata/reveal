import React, { useState } from 'react';
import styled from 'styled-components/macro';
import debounce from 'lodash/debounce';
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
import {
  Chart,
  ChartWorkflow,
  LatestWorkflowRun,
  StorableNode,
} from 'reducers/charts/types';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';
import { CogniteFunction } from 'reducers/charts/Nodes/DSPToolboxFunction';
import { waitOnFunctionComplete } from 'utils/cogniteFunctions';
import { useSDK } from '@cognite/sdk-provider';
import { getTenantFromURL } from 'utils/env';
import { pinTypes, isWorkflowRunnable } from './utils';
import defaultNodeOptions from '../../reducers/charts/Nodes';
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
  chart: Chart;
  workflowId: string;
  mutate: (i: { chart: Chart; skipPersist?: boolean }) => void;
};

const WorkflowEditor = ({ workflowId, chart, mutate }: WorkflowEditorProps) => {
  const sdk = useSDK();

  const [activeNode, setActiveNode] = useState<StorableNode>();
  const tenant = getTenantFromURL();
  const workflow = chart?.workflowCollection?.find(
    (flow) => flow.id === workflowId
  );

  const update = (diff: Partial<ChartWorkflow>) => {
    mutate({
      chart: {
        ...chart,
        workflowCollection: chart.workflowCollection?.map((wf) =>
          wf.id === workflowId
            ? {
                ...wf,
                ...diff,
              }
            : wf
        ),
      },
    });
  };

  const { nodes = [], connections = [] } = workflow || {};
  const context = { chart };

  // This have to be debouced as it is called continuously when dragging nodes
  const onUpdateNode = debounce((nextNode: Node) => {
    const nodeUpdate = nodes.map((node) =>
      node.id === nextNode.id ? nextNode : node
    );
    update({
      nodes: nodeUpdate,
    });
  }, 100);

  const onNewNode = (newNode: Node) => {
    update({
      nodes: [...nodes, newNode],
    });
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

    update({
      nodes: [...nodes].filter((n) => n.id !== node.id),
      connections: newConnections,
    });
  };

  const onRun = async () => {
    if (!workflow) {
      return;
    }

    if (!tenant) {
      return;
    }

    const steps = getStepsFromWorkflow(workflow);

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

    const functions = await sdk.get<{ items: CogniteFunction[] }>(
      `https://api.cognitedata.com/api/playground/projects/${tenant}/functions`
    );

    const simpleCalc = functions.data.items.find(
      (func) => func.name === 'simple_calc-master'
    );

    if (!simpleCalc) {
      return;
    }

    update({
      latestRun: {
        timestamp: Date.now(),
        status: 'RUNNING',
        nodeProgress: workflow.nodes?.reduce((output, node) => {
          return {
            ...output,
            [node.id]: { status: 'RUNNING' },
          };
        }, {}),
      },
    });

    const functionCall = await sdk.post<{ id: number }>(
      `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/call`,
      {
        data: {
          data: { computation_graph: computation },
        },
      }
    );

    await waitOnFunctionComplete(
      sdk,
      tenant,
      simpleCalc.id,
      functionCall.data.id
    );

    const functionResult = await sdk.get<{ response: Record<string, any> }>(
      `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${simpleCalc.id}/calls/${functionCall.data.id}/response`
    );

    if (!functionResult.data.response || functionResult.data?.response?.error) {
      update({
        latestRun: {
          timestamp: Date.now(),
          status: 'FAILED',
          nodeProgress: workflow.nodes?.reduce((output, node) => {
            return {
              ...output,
              [node.id]: { status: 'FAILED' },
            };
          }, {}),
        },
      });
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
      nodeProgress: workflow.nodes?.reduce((output, node) => {
        return {
          ...output,
          [node.id]: { status: 'DONE' },
        };
      }, {}),
    };

    update({
      latestRun,
    });
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
        onConnectionsUpdate={(c: Connection[]) => update({ connections: c })}
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
                  key={nodeOption.name}
                  onClick={() => {
                    onNewNode({
                      id: nanoid(),
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
              key={node.id}
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
