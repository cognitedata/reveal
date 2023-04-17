import { useCallback, useMemo, useRef } from 'react';

import ReactFlow, {
  addEdge,
  Background,
  MarkerType,
  OnConnect,
  ReactFlowInstance,
  OnEdgesChange,
  Controls,
  BackgroundVariant,
  NodeChange,
} from 'reactflow';
import { useState } from 'react';

import styled from 'styled-components';

import { CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER } from 'common';
import { CustomNode } from 'components/custom-node';
import { Colors } from '@cognite/cogs.js';
import { WORKFLOW_COMPONENT_TYPES } from 'utils/workflow';

import * as AM from '@automerge/automerge';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { AFlow } from 'types';
import { ChangeFn } from '@automerge/automerge';

type Props = {};
export const FlowBuilder = ({}: Props): JSX.Element => {
  const { flow: flowState, setFlow, flowRef } = useWorkflowBuilderContext();
  const reactFlowContainer = useRef<HTMLDivElement>(null);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();

  const onEdgesChange: OnEdgesChange = (foo) => {};

  const onNodesChange = (changes: NodeChange[]) => {
    if (!flowRef.current) {
      return;
    }

    const fn: ChangeFn<AFlow> = (f) => {
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
    };
    setFlow(AM.change(flowRef.current, fn));
  };

  const nodeTypes = useMemo(
    () => ({
      customNode: CustomNode,
    }),
    []
  );

  const onConnect: OnConnect = useCallback((connection) => {
    const newEdges = addEdge(
      {
        ...connection,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          height: 16,
          width: 16,
        },
        style: {
          strokeWidth: 1,
        },
      },
      flowRef.current.canvas.edges
    );
  }, []);

  const onDragOver: React.DragEventHandler = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop: React.DragEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      if (flowRef.current && reactFlowContainer.current && reactFlowInstance) {
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

        setFlow(
          AM.change(flowRef.current, (f) => {
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
          })
        );
      }
    },
    [reactFlowInstance, setFlow]
  );

  if (!flowState) {
    return <></>;
  }

  return (
    <Container ref={reactFlowContainer}>
      <ReactFlow
        panOnDrag={false}
        selectionOnDrag
        panOnScroll
        edges={flowState.canvas.edges}
        nodes={flowState.canvas.nodes}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onEdgesChange={onEdgesChange}
        onInit={setReactFlowInstance}
        onNodesChange={onNodesChange}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </Container>
  );
};

const Container = styled.div`
  background-color: ${Colors['surface--strong']};
  height: 100%;
  width: 100%;
`;
