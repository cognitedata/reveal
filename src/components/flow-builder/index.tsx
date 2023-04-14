import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ReactFlow, {
  addEdge,
  Background,
  Edge,
  Node,
  OnConnect,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
  BackgroundVariant,
  Controls,
} from 'reactflow';
import styled from 'styled-components';

import {
  CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
  Z_INDEXES,
} from 'common';
import { CustomNode } from 'components/custom-node';
import { Colors } from '@cognite/cogs.js';
import { WORKFLOW_COMPONENT_TYPES } from 'utils/workflow';
import ContextMenu, {
  WorkflowContextMenu,
} from 'components/context-menu/ContextMenu';

type Props = {
  initialEdges: Edge<any>[];
  initialNodes: Node<any>[];
  onChange: (f: { nodes: Node<any>[]; edges: Edge<any>[] }) => void;
};

export const WorkflowBuilder = ({
  initialEdges,
  initialNodes,
  onChange,
}: Props): JSX.Element => {
  const reactFlowContainer = useRef<HTMLDivElement>(null);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();

  const [contextMenu, setContextMenu] = useState<
    WorkflowContextMenu | undefined
  >(undefined);

  const mutate = useCallback(onChange, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mutate({
      nodes,
      edges,
    });
  }, [nodes, edges, mutate]);

  const nodeTypes = useMemo(
    () => ({
      customNode: CustomNode,
    }),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((prevEdges) =>
        addEdge(
          {
            ...connection,
            style: {
              strokeWidth: 1,
            },
          },
          prevEdges
        )
      );
    },
    [setEdges]
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

        if (
          typeof type === 'undefined' ||
          !type ||
          !WORKFLOW_COMPONENT_TYPES.some((testType) => testType === type)
        ) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
          id: `${new Date().getTime()}`,
          type: 'customNode',
          position,
          data: { label: `${type} node`, type },
        };

        setNodes((prevNodes) => prevNodes.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <Container
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      ref={reactFlowContainer}
    >
      <ReactFlow
        panOnDrag={false}
        selectionOnDrag
        panOnScroll
        edges={edges}
        nodes={nodes}
        nodeTypes={nodeTypes}
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
            items: [node],
            type: 'node',
          });
        }}
        onSelectionContextMenu={(e, nodes) => {
          setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            items: nodes,
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
