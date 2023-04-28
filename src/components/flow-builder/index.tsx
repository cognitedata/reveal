import { ComponentType, useCallback, useRef, useState } from 'react';

import { Extend as AutomergeExtend } from '@automerge/automerge';
import { Colors } from '@cognite/cogs.js';
import ReactFlow, {
  Background,
  MarkerType,
  OnConnect,
  ReactFlowInstance,
  OnEdgesChange,
  Controls,
  BackgroundVariant,
  NodeChange,
  Edge,
  SelectionMode,
  EdgeChange,
  NodeProps,
} from 'reactflow';
import styled from 'styled-components';

import {
  CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
  DELETE_KEY_CODES,
  Z_INDEXES,
} from 'common';
import { ProcessNodeRenderer } from 'components/process-node/ProcessNodeRenderer';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { v4 } from 'uuid';
import ContextMenu, {
  WorkflowContextMenu,
} from 'components/context-menu/ContextMenu';
import { ParentNodeRenderer } from 'components/parent-node/ParentNodeRenderer';
import {
  CanvasNode,
  ProcessNode,
  WorkflowBuilderNode,
  WorkflowBuilderNodeType,
  isProcessType,
} from 'types';

const NODE_TYPES: Record<WorkflowBuilderNodeType, ComponentType<NodeProps>> = {
  process: ProcessNodeRenderer,
  parent: ParentNodeRenderer,
};

export const FlowBuilder = (): JSX.Element => {
  const {
    flow: flowState,
    changeFlow,
    setIsNodeConfigurationPanelOpen,
  } = useWorkflowBuilderContext();

  const reactFlowContainer = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<
    WorkflowContextMenu | undefined
  >(undefined);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();

  const onEdgesChange: OnEdgesChange = (changes: EdgeChange[]) => {
    changeFlow((f) => {
      changes.forEach((change) => {
        switch (change.type) {
          case 'select': {
            const e = f.canvas.edges.find((e) => e.id === change.id);
            if (e) {
              e.selected = change.selected;
            }
            break;
          }
          case 'remove': {
            const eIndex = f.canvas.edges.findIndex((e) => e.id === change.id);
            if (eIndex !== -1) {
              f.canvas.edges.deleteAt(eIndex);
            }
            break;
          }
          default: {
            break;
          }
        }
      });
    });
  };

  const onNodesChange = (changes: NodeChange[]) => {
    changeFlow((f) => {
      changes.forEach((change) => {
        switch (change.type) {
          case 'position': {
            const n = f.canvas.nodes.find((n) => n.id === change.id);
            if (n && change.position) {
              n.position.x = change.position.x;
              n.position.y = change.position.y;
            }
            break;
          }
          case 'select': {
            const n = f.canvas.nodes.find((n) => n.id === change.id);
            const selectednodes = changes.filter((change) => {
              return change.type === 'select' && change.selected;
            });
            if (n) {
              n.selected = change.selected;
              if (change.selected) {
                setIsNodeConfigurationPanelOpen(true);
              } else if (!change.selected && selectednodes.length === 0) {
                setIsNodeConfigurationPanelOpen(false);
              }
            }
            break;
          }
          case 'remove': {
            const nIndex = f.canvas.nodes.findIndex((n) => n.id === change.id);
            if (nIndex !== -1) {
              f.canvas.nodes.deleteAt(nIndex);
            }
            break;
          }
          default: {
            break;
          }
        }
      });
    });
  };

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!!connection.source && !!connection.target) {
        changeFlow((f) => {
          const newEdge: Edge<any> = {
            ...connection,
            source: connection.source!,
            target: connection.target!,
            type: 'default',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              height: 16,
              width: 16,
            },
            style: {
              strokeWidth: 1,
            },
            id: v4(),
          };
          // TODO: figure out this type issue
          // @ts-ignore
          f.canvas.edges.push(newEdge);
        });
      }
    },
    [changeFlow]
  );

  const onDragOver: React.DragEventHandler = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop: React.DragEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      if (reactFlowContainer.current && reactFlowInstance) {
        const reactFlowBounds =
          reactFlowContainer.current.getBoundingClientRect();
        const type = event.dataTransfer.getData(
          CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER
        );

        if (!isProcessType(type)) {
          return;
        }

        changeFlow((f) => {
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

          const node: AutomergeExtend<ProcessNode> = {
            id: `${new Date().getTime()}`,
            type: 'process',
            position,
            data: {
              processType: type,
              processProps: {},
            },
          };
          f.canvas.nodes.push(node);
        });
      }
    },
    [reactFlowInstance, changeFlow]
  );

  // console.log(flow.canvas.nodes);
  // const selectedNodes = canvas.nodes

  if (!flowState) {
    return <></>;
  }

  return (
    <Container
      ref={reactFlowContainer}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <ReactFlow
        panOnDrag={false}
        selectionOnDrag
        panOnScroll
        deleteKeyCode={DELETE_KEY_CODES}
        edges={flowState.canvas.edges as Edge[]} // FIXME: can we remove as
        nodes={flowState.canvas.nodes as WorkflowBuilderNode[]}
        multiSelectionKeyCode={null}
        selectionMode={SelectionMode.Partial}
        nodeTypes={NODE_TYPES}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onEdgesChange={onEdgesChange}
        onInit={setReactFlowInstance}
        onNodesChange={onNodesChange}
        onEdgeContextMenu={(e, edge) => {
          setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            items: [edge],
            type: 'edge',
          });
        }}
        onNodeContextMenu={(e, node) => {
          setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            items: [node as CanvasNode],
            type: 'node',
          });
        }}
        onSelectionContextMenu={(e, nodes) => {
          setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            items: nodes as CanvasNode[],
            type: 'node',
          });
        }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      <ContextMenu
        containerRef={reactFlowContainer}
        contextMenu={contextMenu}
        onClose={() => setContextMenu(undefined)}
      />
    </Container>
  );
};

const Container = styled.div`
  background-color: ${Colors['surface--strong']};
  height: 100%;
  position: relative;
  width: 100%;

  .react-flow__nodes {
    z-index: ${Z_INDEXES.REACT_FLOW_CANVAS_NODES};
  }
`;
