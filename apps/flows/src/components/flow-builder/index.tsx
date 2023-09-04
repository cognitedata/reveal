import { ComponentType, useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  MarkerType,
  OnConnect,
  ReactFlowInstance,
  OnEdgesChange,
  BackgroundVariant,
  NodeChange,
  Edge,
  SelectionMode,
  EdgeChange,
  NodeProps,
  EdgeSelectionChange,
  NodeSelectionChange,
  NodePositionChange,
  NodeMouseHandler,
} from 'reactflow';

import styled from 'styled-components';

import { Extend as AutomergeExtend } from '@automerge/automerge';
import {
  CANVAS_DRAG_AND_DROP_DATA_TRANSFER_IDENTIFIER,
  DELETE_KEY_CODES,
  MAX_ZOOM,
  MIN_ZOOM,
  Z_INDEXES,
} from '@flows/common';
import { CanvasToolbar } from '@flows/components/canvas-toolbar/CanvasToolbar';
import ContextMenu, {
  WorkflowContextMenu,
} from '@flows/components/context-menu/ContextMenu';
import { Controls } from '@flows/components/controls';
import { CustomEdge } from '@flows/components/custom-edge';
import { ParentNodeRenderer } from '@flows/components/parent-node/ParentNodeRenderer';
import { ProcessNodeRenderer } from '@flows/components/process-node/ProcessNodeRenderer';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import {
  CanvasNode,
  ProcessNode,
  WorkflowBuilderNode,
  WorkflowBuilderNodeType,
  isProcessType,
} from '@flows/types';
import { useUserInfo } from '@flows/utils/user';
import { v4 } from 'uuid';

import { Colors } from '@cognite/cogs.js';

const NODE_TYPES: Record<WorkflowBuilderNodeType, ComponentType<NodeProps>> = {
  process: ProcessNodeRenderer,
  parent: ParentNodeRenderer,
};

export const FlowBuilder = (): JSX.Element => {
  const { data: userInfo } = useUserInfo();
  const {
    flow: flowState,
    changeFlow,
    userState,
    setUserState,
    setFocusedProcessNodeId,
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
    const selectChanges = changes.filter(
      (c) => c.type === 'select'
    ) as EdgeSelectionChange[];
    if (selectChanges) {
      setUserState((prevState) => {
        const newState = { ...prevState };
        selectChanges.forEach(({ id, selected }) => {
          if (selected) {
            newState.selectedObjectIds = newState.selectedObjectIds
              .filter((objectId) => objectId !== id)
              .concat(id);
          } else {
            newState.selectedObjectIds = newState.selectedObjectIds.filter(
              (objectId) => objectId !== id
            );
          }
        });
        return newState;
      });
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

  const onNodeDoubleClick: NodeMouseHandler = (_, node) => {
    if (node.data?.processType) {
      setFocusedProcessNodeId(node.id);
    }
  };

  const onNodesChange = (changes: NodeChange[]) => {
    const selectChanges = changes.filter(
      (c) => c.type === 'select'
    ) as NodeSelectionChange[];
    if (selectChanges) {
      setUserState((prevState) => {
        const newState = { ...prevState };
        selectChanges.forEach(({ id, selected }) => {
          if (selected) {
            newState.selectedObjectIds = newState.selectedObjectIds
              .filter((objectId) => objectId !== id)
              .concat(id);
          } else {
            newState.selectedObjectIds = newState.selectedObjectIds.filter(
              (objectId) => objectId !== id
            );
          }
        });
        return newState;
      });
    }

    const amChanges = changes.filter((c) =>
      ['remove', 'position'].includes(c.type)
    );

    if (amChanges.length > 0) {
      changeFlow(
        (flowDoc) => {
          amChanges.forEach((change) => {
            switch (change.type) {
              case 'position': {
                const node = flowDoc.canvas.nodes.find(
                  (n) => n.id === change.id
                );
                if (!node) {
                  break;
                }
                if (change.position && change.position.x !== node.position.x) {
                  node.position.x = change.position.x;
                }
                if (change.position && change.position.y !== node.position.y) {
                  node.position.y = change.position.y;
                }
                if (node.dragging !== change.dragging) {
                  node.dragging = change.dragging;
                }
                break;
              }
              case 'remove': {
                const nIndex = flowDoc.canvas.nodes.findIndex(
                  (n) => n.id === change.id
                );
                if (nIndex !== -1) {
                  flowDoc.canvas.nodes.deleteAt(nIndex);
                }
                break;
              }
              default: {
                break;
              }
            }
          });
        },
        (oldDoc) => {
          const messages = amChanges.reduce((accl, change) => {
            if (
              change.type === 'position' &&
              !change.dragging &&
              oldDoc.canvas.nodes.find((n) => n.id === change.id)?.dragging
            ) {
              return [
                ...accl,
                `Node ${(change as NodePositionChange).id} moved`,
              ];
            }
            return accl;
          }, [] as string[]);

          if (messages.length > 0) {
            return {
              message: JSON.stringify({
                message: messages.join('\n * '),
                user: userInfo?.displayName,
              }),
              time: Date.now(),
            };
          }
        }
      );
    }
  };

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!!connection.source && !!connection.target) {
        changeFlow(
          (f) => {
            const newEdge: Edge<any> = {
              source: connection.source!,
              target: connection.target!,
              type: 'customEdge',
              id: v4(),
            };
            // TODO: figure out this type issue
            // @ts-ignore
            f.canvas.edges.push(newEdge);
          },
          () => ({
            time: Date.now(),
            message: JSON.stringify({
              message: `${connection.source} connected to ${connection.target}`,
              user: userInfo?.displayName,
            }),
          })
        );
      }
    },
    [changeFlow, userInfo?.displayName]
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

        changeFlow(
          (f) => {
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
                processDescription: '',
                processExternalId: '',
                processProps: {},
              },
            };
            f.canvas.nodes.push(node);
          },
          () => ({
            message: JSON.stringify({
              message: 'Node added',
              user: userInfo?.displayName,
            }),
            time: Date.now(),
          })
        );
      }
    },
    [reactFlowInstance, changeFlow, userInfo?.displayName]
  );

  const nodes = useMemo(
    () =>
      flowState.canvas.nodes.map((n) => ({
        ...n,
        selected: userState?.selectedObjectIds.includes(n.id),
        // FIXME: can we remove as
      })) as WorkflowBuilderNode[],
    [flowState.canvas.nodes, userState]
  );

  const edges = useMemo(
    () =>
      flowState.canvas.edges.map((e) => ({
        ...e,
        selected: userState?.selectedObjectIds.includes(e.id),
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          height: 16,
          width: 16,
        },
        style: {
          strokeWidth: 1,
        },
      })) as Edge[],
    [flowState.canvas.edges, userState]
  );

  if (!flowState) {
    return <></>;
  }

  return (
    <FlowBuilderContainer
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
        onNodeDoubleClick={onNodeDoubleClick}
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
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      >
        <Controls />
        <CanvasToolbar />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      <ContextMenu
        containerRef={reactFlowContainer}
        contextMenu={contextMenu}
        onClose={() => setContextMenu(undefined)}
      />
    </FlowBuilderContainer>
  );
};

export const FlowBuilderContainer = styled.div`
  background-color: ${Colors['surface--strong']};
  height: 100%;
  position: relative;
  width: 100%;

  .react-flow__nodes {
    z-index: ${Z_INDEXES.REACT_FLOW_CANVAS_NODES};
  }
`;
