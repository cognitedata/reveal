import { ComponentType, useCallback, useMemo, useRef, useState } from 'react';

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
  EdgeSelectionChange,
  NodeSelectionChange,
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
import { CustomEdge } from 'components/custom-edge';

const NODE_TYPES: Record<WorkflowBuilderNodeType, ComponentType<NodeProps>> = {
  process: ProcessNodeRenderer,
  parent: ParentNodeRenderer,
};

export const FlowBuilder = (): JSX.Element => {
  const {
    flow: flowState,
    changeFlow,
    setSelectedObject,
    selectedObject,
  } = useWorkflowBuilderContext();

  const reactFlowContainer = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<
    WorkflowContextMenu | undefined
  >(undefined);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();

  const edgeTypes = useMemo(
    () => ({
      customEdge: CustomEdge,
    }),
    []
  );

  const onEdgesChange: OnEdgesChange = (changes: EdgeChange[]) => {
    const selectedEdgeChange = changes.find((c) => c.type === 'select');
    if (selectedEdgeChange) {
      setSelectedObject((selectedEdgeChange as EdgeSelectionChange).id);
    }

    const amChanges = changes.filter((c) => ['remove'].includes(c.type));

    if (amChanges.length > 0) {
      changeFlow((f) => {
        amChanges.forEach((change) => {
          switch (change.type) {
            case 'remove': {
              const eIndex = f.canvas.edges.findIndex(
                (e) => e.id === change.id
              );
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
    }
  };

  const onNodesChange = (changes: NodeChange[]) => {
    const selectedNodeChange = changes.find((c) => c.type === 'select');
    if (selectedNodeChange) {
      setSelectedObject((selectedNodeChange as NodeSelectionChange).id);
    }
    const amChanges = changes.filter(
      (c) => c.type === 'remove' || (c.type === 'position' && c.position)
    );
    if (amChanges.length > 0) {
      changeFlow((f) => {
        amChanges.forEach((change) => {
          switch (change.type) {
            case 'position': {
              const n = f.canvas.nodes.find((n) => n.id === change.id);
              if (n && change.position) {
                n.position.x = change.position.x;
                n.position.y = change.position.y;
              }
              break;
            }
            case 'remove': {
              const nIndex = f.canvas.nodes.findIndex(
                (n) => n.id === change.id
              );
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
    }
  };

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!!connection.source && !!connection.target) {
        changeFlow((f) => {
          const newEdge: Edge<any> = {
            ...connection,
            source: connection.source!,
            target: connection.target!,
            type: 'customEdge',
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

  const nodes = useMemo(
    () =>
      flowState.canvas.nodes.map((n) => ({
        ...n,
        selected: n.id === selectedObject,
        // FIXME: can we remove as
      })) as WorkflowBuilderNode[],
    [flowState.canvas.nodes, selectedObject]
  );

  const edges = useMemo(
    () =>
      flowState.canvas.edges.map((e) => ({
        ...e,
        selected: e.id === selectedObject,
      })) as Edge[],
    [flowState.canvas.edges, selectedObject]
  );

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
        edges={edges}
        nodes={nodes}
        multiSelectionKeyCode={null}
        selectionMode={SelectionMode.Partial}
        nodeTypes={NODE_TYPES}
        edgeTypes={edgeTypes}
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
