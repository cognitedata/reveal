import React, { useState } from 'react';
import styled from 'styled-components/macro';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import {
  SourceNode,
  ControllerProvider,
  Node,
  Connection,
  NodeContainer,
} from '@cognite/connect';
import { Menu, Input, Button, toast } from '@cognite/cogs.js';
import { nanoid } from 'nanoid';
import workflowBackgroundSrc from 'assets/workflowBackground.png';
import { Chart, ChartWorkflow, StorableNode } from 'reducers/charts/types';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';
import { useCallFunction } from 'utils/cogniteFunctions';
import { Modes } from 'pages/types';
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
  setWorkspaceMode: (m: Modes) => void;
  mutate: (i: { chart: Chart; skipPersist?: boolean }) => void;
};

const WorkflowEditor = ({
  workflowId,
  chart,
  setWorkspaceMode,
  mutate,
}: WorkflowEditorProps) => {
  const [activeNode, setActiveNode] = useState<StorableNode>();
  const workflow = chart?.workflowCollection?.find(
    (flow) => flow.id === workflowId
  );
  const { mutate: callFunction } = useCallFunction('simple_calc-master');

  if (!workflowId || !workflow) {
    return null;
  }

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

  const { nodes = [], connections = [] } = workflow;
  const context = { chart };

  // This have to be debouced as it is called continuously when dragging nodes
  const onUpdateNode = debounce((nextNode: Node) => {
    const nodeUpdate = nodes.map((node) =>
      node.id === nextNode.id ? nextNode : node
    );
    const deleteCalls = !isEqual(
      getStepsFromWorkflow(workflow),
      getStepsFromWorkflow({
        ...workflow,
        nodes: nodeUpdate,
      })
    );

    if (deleteCalls) {
      update({
        nodes: nodeUpdate,
        calls: [],
      });
    } else {
      update({
        nodes: nodeUpdate,
      });
    }
  }, 100);

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
      calls: [],
    });
  };

  const onRun = async () => {
    if (!workflow) {
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

    callFunction(
      { data: { computation_graph: computation } },
      {
        onSuccess({ functionId, callId }) {
          update({
            calls: [
              {
                callDate: Date.now(),
                functionId,
                callId,
              },
            ],
          });
        },
        onError() {
          toast.warn('Could not execute workflow');
        },
      }
    );
  };

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
                    update({
                      nodes: [
                        ...nodes,
                        {
                          id: nanoid(),
                          ...nodeOption.node,
                          ...nodePosition,
                          calls: [],
                        },
                      ],
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
              status="LOADING"
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
          onSave={(node) => {
            onUpdateNode(node);
            setActiveNode(undefined);
          }}
          onClose={() => {
            setActiveNode(undefined);
          }}
          onRemove={() => {
            onRemoveNode(activeNode);
            setActiveNode(undefined);
          }}
          context={context}
        />
      )}

      <Button
        type="primary"
        style={{ position: 'absolute', top: 16, right: 100 }}
        disabled={!isWorkflowRunnable(nodes || [])}
        onClick={onRun}
      >
        Run
      </Button>
      <Button
        style={{ position: 'absolute', top: 16, right: 16 }}
        onClick={() => setWorkspaceMode('workspace')}
      >
        Close
      </Button>
    </WorkflowContainer>
  );
};

export default WorkflowEditor;
