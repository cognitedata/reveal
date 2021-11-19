import { Operation } from '@cognite/calculation-backend';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Elements,
  FlowExportObject,
  Node,
  OnLoadParams as RFInstance,
  removeElements,
  updateEdge,
  useStoreActions,
} from 'react-flow-renderer';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';
import { NodeTypes } from 'models/node-editor/types';
import {
  duplicateNode,
  initializeFunctionData,
  restoreSavedFlow,
  updateNodeData,
  updatePosition,
} from './utils';
import AddButton, { AddMenu } from './AddButton';
import EditorControls from './EditorControls/EditorControls';
import ConstantNode from './CustomNodes/ConstantNode';
import FunctionNode from './CustomNodes/FunctionNode/FunctionNode';
import OutputNode from './CustomNodes/OutputNode';
import SourceNode from './CustomNodes/SourceNode';

export type ReactFlowNodeEditorProps = {
  sources: (ChartTimeSeries | ChartWorkflow)[];
  operations: [boolean, (Error | undefined)?, (Operation[] | undefined)?];
  output: { id?: string; name?: string; color?: string };
  getSavedFlow: () => FlowExportObject | undefined;
  saveFlow?: (flow: FlowExportObject) => void;
  autoAlign?: boolean;
  saveAutoAlign?: (autoAlign: boolean) => void;
  saveOutputName?: (name: string) => void;
  onEditorClick?: () => void;
};

const ReactFlowNodeEditor = ({
  sources,
  operations,
  output,
  getSavedFlow,
  saveFlow,
  autoAlign,
  saveAutoAlign,
  saveOutputName,
  onEditorClick,
}: ReactFlowNodeEditorProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<Elements>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<RFInstance | null>(
    null
  );
  const [contextMenuPosition, setContextMenuPosition] = useState<
    React.MouseEvent | undefined
  >();

  const setSelectedElements = useStoreActions(
    (actions) => actions.setSelectedElements
  );

  const onElementsRemove = (elementsToRemove: Elements) => {
    setElements((els) =>
      removeElements(
        elementsToRemove.filter((el) => el.type !== NodeTypes.OUTPUT),
        els
      )
    );
  };

  const onConnect = (connection: Edge | Connection) => {
    const targetNode = elements.find((el) => el.id === connection.target);
    const oldOutputConnection = elements.find(
      (el) => (el as Edge).target === connection.target
    ) as Edge;

    // Allow only one connection to Output Node
    if (targetNode?.type !== NodeTypes.OUTPUT || !oldOutputConnection) {
      setElements((els) => addEdge(connection, els));
      return;
    }

    setElements((els) =>
      updateEdge(oldOutputConnection, connection as Connection, els)
    );
  };

  const onEdgeUpdate = (oldEdge: Edge, newConnection: Connection) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els));

  const onNodeDragStop = (_: React.MouseEvent, node: Node) => {
    setElements((els) => updatePosition(els, node));
  };

  const getPosition = (event: React.MouseEvent): { x: number; y: number } => {
    let position = { x: 100, y: 100 };
    if (reactFlowWrapper.current && reactFlowInstance) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
    }

    return position;
  };

  /*
    DATA CHANGE HANDLERS
  */
  const handleDuplicateNode = (nodeId: string, nodeType: NodeTypes) => {
    const newNodeId = nanoid();
    setElements((els) => duplicateNode(els, nodeId, newNodeId));
    setSelectedElements([{ id: newNodeId, type: nodeType }]);
  };

  const handleRemoveNode = (nodeId: string) => {
    setElements((els) => {
      const elementsToRemove = els.filter(
        (el) =>
          el.id === nodeId ||
          (el as Edge).target === nodeId ||
          (el as Edge).source === nodeId
      );

      return removeElements(
        elementsToRemove.filter((el) => el.type !== NodeTypes.OUTPUT),
        els
      );
    });
  };

  const handleSourceItemChange = (
    nodeId: string,
    newSourceId: string,
    newType: string
  ) => {
    setElements((els) =>
      updateNodeData(els, nodeId, {
        selectedSourceId: newSourceId,
        type: newType,
      })
    );
  };

  const handleOutputNameChange = (
    nodeId: string,
    newCalculationName: string
  ) => {
    setElements((els) =>
      updateNodeData(els, nodeId, {
        name: newCalculationName,
      })
    );
  };

  const handleFunctionDataChange = (
    nodeId: string,
    formData: { [key: string]: any }
  ) => {
    setElements((els) => {
      const node = els.find((el) => el.id === nodeId) as Node;
      return updateNodeData(els, nodeId, {
        functionData: {
          ...node?.data?.functionData,
          ...formData,
        },
      });
    });
  };

  const handleConstantChange = (nodeId: string, value: number) => {
    setElements((els) => updateNodeData(els, nodeId, { value }));
  };

  /*
    ADD NODE HANDLERS
  */
  const addSourceNode = (
    event: React.MouseEvent,
    source: ChartTimeSeries | ChartWorkflow
  ) => {
    const newNode = {
      id: nanoid(),
      type: NodeTypes.SOURCE,
      data: {
        type: source.type,
        selectedSourceId: source.id,
        sourceOptions: sources.map((s) => ({
          type: s.type,
          color: s.color,
          label: s.name,
          value: s.id,
        })),
        onSourceItemChange: handleSourceItemChange,
        onDuplicateNode: handleDuplicateNode,
        onRemoveNode: handleRemoveNode,
      },
      position: getPosition(contextMenuPosition || event),
    };
    setContextMenuPosition(undefined);
    setElements((els) => els.concat(newNode));
  };

  const addFunctionNode = (
    event: React.MouseEvent,
    toolFunction: Operation
  ) => {
    const newNode = {
      id: nanoid(),
      type: NodeTypes.FUNCTION,
      data: {
        toolFunction,
        functionData: initializeFunctionData(toolFunction),
        onFunctionDataChange: handleFunctionDataChange,
        onDuplicateNode: handleDuplicateNode,
        onRemoveNode: handleRemoveNode,
      },
      position: getPosition(contextMenuPosition || event),
    };
    setContextMenuPosition(undefined);
    setElements((els) => els.concat(newNode));
  };

  const addConstantNode = (event: React.MouseEvent) => {
    const newNode = {
      id: nanoid(),
      type: NodeTypes.CONSTANT,
      data: {
        value: 1,
        onConstantChange: handleConstantChange,
        onDuplicateNode: handleDuplicateNode,
        onRemoveNode: handleRemoveNode,
      },
      position: getPosition(contextMenuPosition || event),
    };
    setContextMenuPosition(undefined);
    setElements((els) => els.concat(newNode));
  };

  const addOutputNode = () => {
    let position = { x: 1000, y: 200 };
    if (reactFlowWrapper.current) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      position = {
        x: reactFlowBounds.width - 250,
        y: reactFlowBounds.height / 2,
      };
    }

    const newNode = {
      id: nanoid(),
      type: NodeTypes.OUTPUT,
      data: {
        color: output?.color || '#458440',
        name: output?.name || 'New Calculation',
        saveOutputName,
        onOutputNameChange: handleOutputNameChange,
      },
      position,
    };
    setElements(() => [newNode]);
  };

  // Restore saved flow
  useEffect(() => {
    const flow = getSavedFlow();
    if (!flow || !flow.elements || flow.elements.length === 0) {
      addOutputNode();
      return;
    }

    // JSON.stringify removes callbacks from objects, add them back
    const callbacks = {
      onSourceItemChange: handleSourceItemChange,
      onConstantChange: handleConstantChange,
      onFunctionDataChange: handleFunctionDataChange,
      onOutputNameChange: handleOutputNameChange,
      onDuplicateNode: handleDuplicateNode,
      onRemoveNode: handleRemoveNode,
      saveOutputName,
    };

    setElements(restoreSavedFlow(flow, callbacks));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output?.id]);

  // Save changes to the editor when there are changes to elements
  useEffect(() => {
    if (saveFlow && reactFlowInstance) {
      saveFlow(JSON.parse(JSON.stringify(reactFlowInstance.toObject())));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  return (
    <NodeEditorContainer ref={reactFlowWrapper} onClick={onEditorClick}>
      <ReactFlow
        elements={elements}
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
      >
        <EditorControls autoAlign={autoAlign} saveAutoAlign={saveAutoAlign} />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <AddButton
        sources={sources}
        operations={operations}
        addSourceNode={addSourceNode}
        addFunctionNode={addFunctionNode}
        addConstantNode={addConstantNode}
      />
      {contextMenuPosition && (
        <ContextMenu
          position={{
            x: contextMenuPosition.clientX,
            y: contextMenuPosition.clientY,
          }}
        >
          <AddMenu
            sources={sources}
            operations={operations}
            addSourceNode={addSourceNode}
            addFunctionNode={addFunctionNode}
            addConstantNode={addConstantNode}
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
