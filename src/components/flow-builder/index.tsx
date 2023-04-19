import { useCallback, useRef, useState } from 'react';

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
} from 'reactflow';

import styled from 'styled-components';

import {
  CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
  Z_INDEXES,
} from 'common';
import { CustomNode } from 'components/custom-node';
import { Colors } from '@cognite/cogs.js';
import { WORKFLOW_COMPONENT_TYPES } from 'utils/workflow';

import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { v4 } from 'uuid';
import ContextMenu, {
  WorkflowContextMenu,
} from 'components/context-menu/ContextMenu';
import { GroupNode } from 'components/group-node/GroupNode';

const NODE_TYPES = {
  customNode: CustomNode,
  groupNode: GroupNode,
};

type Props = {};
export const FlowBuilder = ({}: Props): JSX.Element => {
  const { flow: flowState, changeFlow } = useWorkflowBuilderContext();

  const reactFlowContainer = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<
    WorkflowContextMenu | undefined
  >(undefined);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();

  const onEdgesChange: OnEdgesChange = () => {};

  const onNodesChange = (changes: NodeChange[]) => {
    changeFlow((f) => {
      changes.forEach((change) => {
        switch (change.type) {
          case 'position': {
            if (change.position) {
              const i = f.canvas.nodes.findIndex((n) => n.id === change.id);
              f.canvas.nodes[i].position.x = change.position.x;
              f.canvas.nodes[i].position.y = change.position.y;
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

        if (
          typeof type === 'undefined' ||
          !type ||
          !WORKFLOW_COMPONENT_TYPES.some((testType) => testType === type)
        ) {
          return;
        }

        changeFlow((f) => {
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
          f.canvas.nodes.push(newNode);
        });
      }
    },
    [reactFlowInstance, changeFlow]
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
        deleteKeyCode={['Backspace', 'Delete']}
        edges={flowState.canvas.edges}
        nodes={flowState.canvas.nodes}
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
        setNodes={() => {
          throw new Error('Function not implemented.');
        }}
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
