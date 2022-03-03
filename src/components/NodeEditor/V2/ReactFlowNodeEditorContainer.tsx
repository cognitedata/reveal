import {
  useStoreActions,
  Elements,
  Connection,
  Edge,
  Node,
  XYPosition,
  FlowTransform,
} from 'react-flow-renderer';
import { ChartSettings, ChartWorkflowV2 } from 'models/chart/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ComputationStep, Operation } from '@cognite/calculation-backend';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';
import {
  NodeTypes,
  SourceOption,
  NodeCallbacks,
  NodeDataVariants,
} from './types';
import {
  addNodeInFlow,
  duplicateNodeInFlow,
  makeConnectionInFlow,
  removeElementsFromFlow,
  removeNodeInFlow,
  updateConstantInFlow,
  updateFlowEdge,
  updateFlowPositionAndZoom,
  updateFlowSettings,
  updateParameterValuesInFlow,
  updateNodePositionInFlow,
  updateSourceItemInFlow,
  updateWorkflowName,
} from './updates';
import { ConstantNodeDataDehydrated } from './Nodes/ConstantNode';
import { FunctionNodeDataDehydrated } from './Nodes/FunctionNode/FunctionNode';
import { OutputNodeDataDehydrated } from './Nodes/OutputNode';
import { SourceNodeDataDehydrated } from './Nodes/SourceNode';
import { initializeParameterValues, rehydrateStoredFlow } from './utils';
import ReactFlowNodeEditor from './ReactFlowNodeEditor';
import { getStepsFromWorkflowReactFlow } from './transforms';
import { validateSteps } from './calculations';
import { defaultTranslations } from '../translations';

export type NodeEditorContainerProps = {
  workflow: ChartWorkflowV2;
  workflows: ChartWorkflowV2[];
  operations: Operation[];
  sources: SourceOption[];
  settings?: ChartSettings;
  onClose: () => void;
  onUpdateWorkflow: (
    wf: ChartWorkflowV2,
    steps: ComputationStep[],
    isValid: boolean
  ) => void;
  readOnly?: boolean;
  translations: typeof defaultTranslations;
};

const ReactFlowNodeEditorContainer = ({
  workflow,
  workflows = [],
  operations = [],
  sources,
  onClose,
  onUpdateWorkflow = () => {},
  readOnly = false,
  translations: t,
}: NodeEditorContainerProps) => {
  /**
   * Hook onto the internal react-flow state
   * to be able to set selected element
   */
  const setSelectedElements = useStoreActions(
    (actions) => actions.setSelectedElements
  );

  /**
   * Use internal state by default (but)
   */
  const [localWorkflow, setLocalWorkflow] = useState(workflow);

  /**
   * Overwrite local workflow state if new workflow prop is passed from outside
   */
  useEffect(() => {
    setLocalWorkflow(workflow);
  }, [workflow]);

  /**
   * Calculate computation steps
   */
  const steps = useMemo(
    () => getStepsFromWorkflowReactFlow(localWorkflow, workflows, operations),
    [localWorkflow, workflows, operations]
  );

  /**
   * Check if current steps are valid based on operations supplied
   */
  const isValid = validateSteps(steps, operations);

  /**
   * Data handlers
   */
  const handleSaveSettings = (updatedSettings: ChartWorkflowV2['settings']) => {
    const newWorkflow = updateFlowSettings(localWorkflow, updatedSettings);
    setLocalWorkflow(() => newWorkflow);
    onUpdateWorkflow(newWorkflow, steps, isValid);
  };

  const handleUpdatePositionAndZoom = useCallback(
    (transform: FlowTransform) => {
      const updatedWorkflow = updateFlowPositionAndZoom(
        localWorkflow,
        transform
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleUpdateOutputName = useCallback(
    (newCalculationName: string) => {
      const updatedWorkflow = updateWorkflowName(
        localWorkflow,
        newCalculationName
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleRemoveElements = useCallback(
    (elementsToRemove: Elements<NodeDataVariants>) => {
      const updatedWorkflow = removeElementsFromFlow(
        localWorkflow,
        elementsToRemove
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleConnect = useCallback(
    (connection: Edge | Connection) => {
      const updatedWorkflow = makeConnectionInFlow(localWorkflow, connection);

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const updatedWorkflow = updateFlowEdge(
        localWorkflow,
        oldEdge,
        newConnection
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node<NodeDataVariants>) => {
      const updatedWorkflow = updateNodePositionInFlow(localWorkflow, node);

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string, nodeType: NodeTypes) => {
      const newNodeId = uuidv4();
      const updatedWorkflow = duplicateNodeInFlow(
        localWorkflow,
        nodeId,
        newNodeId
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
      setSelectedElements([{ id: newNodeId, type: nodeType }]);
    },
    [onUpdateWorkflow, setSelectedElements, localWorkflow, steps, isValid]
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      const updatedWorkflow = removeNodeInFlow(localWorkflow, nodeId);

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleSourceItemChange = useCallback(
    (nodeId: string, newSourceId: string, newType: string) => {
      const updatedWorkflow = updateSourceItemInFlow(
        localWorkflow,
        nodeId,
        newSourceId,
        newType
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleParameterValuesChange = useCallback(
    (nodeId: string, parameterValues: { [key: string]: any }) => {
      const updatedWorkflow = updateParameterValuesInFlow(
        localWorkflow,
        nodeId,
        parameterValues
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleConstantChange = useCallback(
    (nodeId: string, value: number) => {
      const updatedWorkflow = updateConstantInFlow(
        localWorkflow,
        nodeId,
        value
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  /**
   * Node handlers
   */
  const handleAddSourceNode = useCallback(
    (position: XYPosition, source: SourceOption) => {
      const nodeId = uuidv4();

      const newNode: Node<SourceNodeDataDehydrated> = {
        id: nodeId,
        type: NodeTypes.SOURCE,
        data: {
          selectedSourceId: source.value,
          type: source.type,
        },
        position,
      };

      const updatedWorkflow = addNodeInFlow(localWorkflow, newNode);

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleAddFunctionNode = useCallback(
    (position: XYPosition, operation: Operation, version: string) => {
      const nodeId = uuidv4();

      const selectedOperationVersion = operation.versions.find(
        (operationVersion) => operationVersion.version === version
      )!;

      const newNode: Node<FunctionNodeDataDehydrated> = {
        id: nodeId,
        type: NodeTypes.FUNCTION,
        data: {
          selectedOperation: { op: operation.op, version },
          parameterValues: initializeParameterValues(selectedOperationVersion),
        },
        position,
      };

      const updatedWorkflow = addNodeInFlow(localWorkflow, newNode);

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleAddConstantNode = useCallback(
    (position: XYPosition) => {
      const nodeId = uuidv4();

      const newNode: Node<ConstantNodeDataDehydrated> = {
        id: nodeId,
        type: NodeTypes.CONSTANT,
        data: { value: 1 },
        position,
      };

      const updatedWorkflow = addNodeInFlow(localWorkflow, newNode);

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleAddOutputNode = useCallback(
    (position: XYPosition) => {
      const nodeId = uuidv4();

      const newNode: Node<OutputNodeDataDehydrated> = {
        id: nodeId,
        type: NodeTypes.OUTPUT,
        data: {},
        position,
      };

      const updatedWorkflow = addNodeInFlow(localWorkflow, newNode);

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  /**
   * Create a map of all the callbacks
   * for the nodes
   */
  const callbacks: NodeCallbacks = useMemo(
    () => ({
      onSourceItemChange: handleSourceItemChange,
      onConstantChange: handleConstantChange,
      onParameterValuesChange: handleParameterValuesChange,
      onOutputNameChange: handleUpdateOutputName,
      onDuplicateNode: handleDuplicateNode,
      onRemoveNode: handleRemoveNode,
    }),
    [
      handleDuplicateNode,
      handleConstantChange,
      handleParameterValuesChange,
      handleUpdateOutputName,
      handleRemoveNode,
      handleSourceItemChange,
    ]
  );

  /**
   * Rehydrate the stored nodes into live data,
   * which we'll provide to react-flow
   */
  const flowElements = useMemo(
    () =>
      rehydrateStoredFlow(
        localWorkflow,
        sources,
        operations,
        callbacks,
        readOnly,
        t
      ),
    [localWorkflow, sources, operations, callbacks, readOnly, t]
  );

  /**
   * Get stored position and zoom level
   */
  const zoom = localWorkflow.flow?.zoom;
  const position = localWorkflow.flow?.position;

  return (
    <>
      <ReactFlowNodeEditor
        readOnly={readOnly}
        id={localWorkflow.id}
        position={position}
        zoom={zoom}
        flowElements={flowElements}
        sources={sources}
        operations={operations}
        settings={localWorkflow.settings || { autoAlign: true }}
        isValid={isValid}
        onSaveSettings={handleSaveSettings}
        onElementsRemove={handleRemoveElements}
        onConnect={handleConnect}
        onEdgeUpdate={handleEdgeUpdate}
        onNodeDragStop={handleNodeDragStop}
        onAddSourceNode={handleAddSourceNode}
        onAddConstantNode={handleAddConstantNode}
        onAddFunctionNode={handleAddFunctionNode}
        onAddOutputNode={handleAddOutputNode}
        onMove={handleUpdatePositionAndZoom}
        translations={t}
      />
      <CloseButton
        icon="Close"
        type="ghost"
        onClick={() => {
          onClose();
        }}
        aria-label={t.Close}
      />
    </>
  );
};

const CloseButton = styled(Button)`
  position: absolute;
  top: 0;
  right: 0;
  z-index: ${Layers.MINIMUM};
`;

export default ReactFlowNodeEditorContainer;
