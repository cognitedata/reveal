import ReactFlow, {
  Background,
  OnLoadParams as RFInstance,
  BackgroundVariant,
  Elements,
  Edge,
  Connection,
  Node,
  XYPosition,
  FlowTransform,
} from 'react-flow-renderer';

import { trackUsage } from 'services/metrics';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Operation } from '@cognite/calculation-backend';
import { usePrevious } from 'react-use';
import { NodeTypes, SourceOption, NodeDataVariants } from './types';
import AddButton, { AddMenu } from './AddButton';
import EditorControls from './EditorControls/EditorControls';
import { getOutputNodePosition } from './utils';
import FunctionNode from './Nodes/FunctionNode/FunctionNode';
import ConstantNode from './Nodes/ConstantNode';
import OutputNode from './Nodes/OutputNode';
import SourceNode from './Nodes/SourceNode';

export type NodeEditorProps = {
  id?: string;
  position?: [number, number];
  zoom?: number;
  flowElements: Elements<NodeDataVariants>;
  sources: SourceOption[];
  operations: Operation[];
  autoAlign: boolean;
  isValid: boolean;
  onToggleAutoAlign: (autoAlign: boolean) => void;
  onElementsRemove: (elementsToRemove: Elements<NodeDataVariants>) => void;
  onConnect: (connection: Edge | Connection) => void;
  onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => void;
  onNodeDragStop: (_: React.MouseEvent, node: Node<NodeDataVariants>) => void;
  onAddSourceNode: (position: XYPosition, source: SourceOption) => void;
  onAddConstantNode: (position: XYPosition) => void;
  onAddFunctionNode: (position: XYPosition, toolFunction: Operation) => void;
  onAddOutputNode: (position: XYPosition) => void;
  onMove: (transform: FlowTransform) => void;
};

const ReactFlowNodeEditor = ({
  id = '1',
  position = [0, 0],
  zoom = 1,
  flowElements,
  sources,
  operations,
  autoAlign,
  onToggleAutoAlign,
  onElementsRemove,
  onConnect,
  onEdgeUpdate,
  onNodeDragStop,
  onAddSourceNode,
  onAddConstantNode,
  onAddFunctionNode,
  onAddOutputNode,
  onMove,
}: NodeEditorProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [reactFlowInstance, setReactFlowInstance] = useState<RFInstance | null>(
    null
  );

  const [contextMenuPosition, setContextMenuPosition] = useState<
    React.MouseEvent | undefined
  >();

  const handleEditorClick = useCallback(() => {
    trackUsage('NodeEditor.Click', { editor: 'React Flow' });
  }, []);

  const getPosition = useCallback(
    (event: React.MouseEvent): XYPosition => {
      let nodePosition = { x: 100, y: 100 };

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        nodePosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
      }

      return nodePosition;
    },
    [reactFlowInstance]
  );

  /**
   * Transform handler (position and zoom)
   */
  const handleMove = useCallback(
    (transform) => {
      onMove(transform);
    },
    [onMove]
  );

  /**
   * Node handlers
   */
  const addSourceNode = useCallback(
    (event: React.MouseEvent, source: SourceOption) => {
      const nodePosition = getPosition(contextMenuPosition || event);
      onAddSourceNode(nodePosition, source);
      setContextMenuPosition(undefined);
    },
    [onAddSourceNode, contextMenuPosition, getPosition]
  );

  const addFunctionNode = useCallback(
    (event: React.MouseEvent, toolFunction: Operation) => {
      const nodePosition = getPosition(contextMenuPosition || event);
      onAddFunctionNode(nodePosition, toolFunction);
      setContextMenuPosition(undefined);
    },
    [onAddFunctionNode, contextMenuPosition, getPosition]
  );

  const addConstantNode = useCallback(
    (event: React.MouseEvent) => {
      const nodePosition = getPosition(contextMenuPosition || event);
      onAddConstantNode(nodePosition);
      setContextMenuPosition(undefined);
    },
    [onAddConstantNode, contextMenuPosition, getPosition]
  );

  const addOutputNode = useCallback(
    (event?: React.MouseEvent) => {
      const nodePosition = event
        ? getPosition(contextMenuPosition || event)
        : getOutputNodePosition(reactFlowWrapper.current);
      onAddOutputNode(nodePosition);
      setContextMenuPosition(undefined);
    },
    [onAddOutputNode, contextMenuPosition, getPosition]
  );

  /**
   * Mechanism to force refresh the editor when
   * changing to another flow (currently the only way of forcing the zoom and position to update)
   */
  const previousId = usePrevious(id);
  const [isRenderable, setIsRenderable] = useState(true);

  useEffect(() => {
    setIsRenderable(previousId === id);
  }, [previousId, id]);

  return (
    <NodeEditorContainer ref={reactFlowWrapper} onClick={handleEditorClick}>
      {isRenderable && (
        <ReactFlow
          defaultPosition={position}
          defaultZoom={zoom}
          elements={flowElements}
          nodeTypes={{
            [NodeTypes.SOURCE]: SourceNode,
            [NodeTypes.FUNCTION]: FunctionNode,
            [NodeTypes.CONSTANT]: ConstantNode,
            [NodeTypes.OUTPUT]: OutputNode,
          }}
          onLoad={setReactFlowInstance}
          onElementsRemove={onElementsRemove}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onNodeDragStop={onNodeDragStop}
          onPaneClick={() => {
            setContextMenuPosition(undefined);
          }}
          onPaneContextMenu={(e) => {
            e.preventDefault();
            setContextMenuPosition(e);
          }}
          onMoveEnd={handleMove}
        >
          <EditorControls
            autoAlign={autoAlign}
            onToggleAutoAlign={onToggleAutoAlign}
          />
          <Background variant={BackgroundVariant.Dots} />
        </ReactFlow>
      )}
      <AddButton
        elements={flowElements}
        sources={sources}
        operations={operations}
        addSourceNode={addSourceNode}
        addFunctionNode={addFunctionNode}
        addConstantNode={addConstantNode}
        addOutputNode={addOutputNode}
      />
      {contextMenuPosition && (
        <ContextMenu
          position={{
            x: contextMenuPosition.clientX,
            y: contextMenuPosition.clientY,
          }}
        >
          <AddMenu
            elements={flowElements}
            sources={sources}
            operations={operations}
            addSourceNode={addSourceNode}
            addFunctionNode={addFunctionNode}
            addConstantNode={addConstantNode}
            addOutputNode={addOutputNode}
          />
        </ContextMenu>
      )}
    </NodeEditorContainer>
  );
};

const NodeEditorContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  flex-grow: 9;
  overflow-y: hidden;
  background: var(--cogs-greyscale-grey2);

  path.react-flow__edge-path {
    stroke-width: 2;
  }
`;

const ContextMenu = styled.div`
  position: fixed;
  margin: 0;
  left: 0;
  top: 0;
  z-index: ${Layers.MINIMUM};
  --mouse-x: ${(props: { position: { x: number; y: number } }) =>
    props.position.x}px;
  --mouse-y: ${(props: { position: { x: number; y: number } }) =>
    props.position.y}px;
  transform: translateX(min(var(--mouse-x), calc(100vw - 100%)))
    translateY(min(var(--mouse-y), calc(100vh - 100%)));
`;

export default ReactFlowNodeEditor;
