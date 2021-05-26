import React, { useRef, useState } from 'react';
import styled from 'styled-components/macro';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import {
  SourceNode,
  ControllerProvider,
  Node,
  Connection,
  NodeContainer,
  CtxPosition,
} from '@cognite/connect';
import { Menu, Input, Dropdown, Button } from '@cognite/cogs.js';
import { nanoid } from 'nanoid';
import workflowBackgroundSrc from 'assets/workflowBackground.png';
import { Chart, ChartWorkflow, StorableNode } from 'reducers/charts/types';
import { getStepsFromWorkflow } from 'utils/transforms';
import { Modes } from 'pages/types';
import { pinTypes } from './utils';
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
  mutate: (chart: Chart) => void;
};

const WorkflowEditor = ({
  workflowId,
  chart,
  setWorkspaceMode,
  mutate,
}: WorkflowEditorProps) => {
  const [activeNode, setActiveNode] = useState<StorableNode>();
  const [isAddNodeMenuOpen, setAddNodeMenuVisibility] = useState(false);
  const defaultNewNodePosition = { x: 0, y: 0 };
  const defaultCanvasPosition = { x: 0, y: 0 };
  const [newNodePosition, setNewNodePosition] = useState<CtxPosition>(
    defaultNewNodePosition
  );
  const [newNode, setNewNode] = useState<StorableNode>();
  const [canvasPosition, setCanvasPosition] = useState<CtxPosition>(
    defaultCanvasPosition
  );
  const nodeEditor = useRef<HTMLDivElement>(null);
  const workflow = chart?.workflowCollection?.find(
    (flow) => flow.id === workflowId
  );

  if (!workflowId || !workflow) {
    return null;
  }

  const update = (diff: Partial<ChartWorkflow>) => {
    mutate({
      ...chart,
      workflowCollection: chart.workflowCollection?.map((wf) =>
        wf.id === workflowId
          ? {
              ...wf,
              ...diff,
            }
          : wf
      ),
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
      getStepsFromWorkflow(workflow.nodes, workflow.connections),
      getStepsFromWorkflow(nodeUpdate, workflow.connections)
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

  const toggleAddNodeMenu = (state: boolean) => {
    setAddNodeMenuVisibility(state);
  };

  const setNodePosition = (event: React.MouseEvent) => {
    if (nodeEditor?.current) {
      const n: HTMLElement = nodeEditor.current;
      const { x, y } = n.getBoundingClientRect();

      const result = {
        x: event.clientX - x - canvasPosition.x,
        y: event.clientY - y - canvasPosition.y,
      };

      setNewNodePosition(result);
    }
  };

  const moveNewNode = (e: React.MouseEvent) => {
    if (newNode) {
      setNodePosition(e);
      const { x, y } = newNodePosition;
      setNewNode({ ...newNode, x: x - 25, y: y - 20 });
    }
  };

  const placeNewNode = () => {
    update({
      nodes: [...nodes, newNode as StorableNode],
    });
    setNewNode(undefined);
  };

  return (
    <WorkflowContainer ref={nodeEditor} onMouseMove={moveNewNode}>
      <ControllerProvider
        pinTypes={pinTypes}
        connections={connections}
        onConnectionsUpdate={(c: Connection[]) => update({ connections: c })}
      >
        <NodeContainer
          onCanvasDrag={setCanvasPosition}
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
          {newNode ? (
            <SourceNode
              key={newNode.id}
              node={newNode}
              status="LOADING"
              onClick={placeNewNode}
            />
          ) : (
            ''
          )}
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

      <div style={{ position: 'absolute', top: 16, left: 16 }}>
        <Dropdown
          visible={isAddNodeMenuOpen}
          appendTo="parent"
          placement="right-start"
          onClickOutside={() => toggleAddNodeMenu(false)}
          content={
            <Menu
              style={{ marginTop: '-10.5px' }}
              onMouseOver={(e) => setNodePosition(e)}
            >
              {Object.values(defaultNodeOptions).map((nodeOption) => (
                <Menu.Item
                  key={nodeOption.name}
                  onClick={() => {
                    setNewNode({
                      id: nanoid(),
                      ...nodeOption.node,
                      ...newNodePosition,
                      calls: [],
                    });

                    toggleAddNodeMenu(false);
                  }}
                >
                  {nodeOption.name}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button
            type="primary"
            icon="Plus"
            onClick={() => toggleAddNodeMenu(true)}
          >
            Add
          </Button>
        </Dropdown>
      </div>

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
        style={{ position: 'absolute', top: 16, right: 16 }}
        onClick={() => setWorkspaceMode('workspace')}
      >
        Close
      </Button>
    </WorkflowContainer>
  );
};

export default WorkflowEditor;
