import { useCallback, useMemo, useRef } from 'react';

import ReactFlow, {
  addEdge,
  Background,
  OnConnect,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'react-flow-renderer';
import { useState } from 'react';

import styled from 'styled-components';

import { CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER } from 'common';
import { CANVAS_BLOCK_TYPES } from 'components/canvas-block';
import { CustomNode } from 'components/custom-node';

export const FlowBuilder = (): JSX.Element => {
  const reactFlowContainer = useRef<HTMLDivElement>(null);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();

  const nodeTypes = useMemo(
    () => ({
      customNode: CustomNode,
    }),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((prevEdges) => addEdge(connection, prevEdges));
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
          !CANVAS_BLOCK_TYPES.some((blockType) => blockType === type)
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
    <StyledReactFlowContainer ref={reactFlowContainer}>
      <ReactFlow
        edges={edges}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onEdgesChange={onEdgesChange}
        onInit={setReactFlowInstance}
        onNodesChange={onNodesChange}
      >
        <Background />
      </ReactFlow>
    </StyledReactFlowContainer>
  );
};

const StyledReactFlowContainer = styled.div`
  height: 100%;
  width: 100%;
`;
