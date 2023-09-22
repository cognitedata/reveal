import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useStoreActions,
  Elements,
  Connection,
  Edge,
  Node,
  XYPosition,
  FlowTransform,
} from 'react-flow-renderer';

import { ScheduledCalculationDeleteModal } from '@charts-app/components/ScheduledCalculation/ScheduledCalculationDeleteModal';
import { useScheduledCalculationDeleteMutate } from '@charts-app/domain/scheduled-calculation/internal/queries/useScheduledCalculationDeleteMutate';
import { ScheduledCalculationData } from '@charts-app/models/scheduled-calculation-results/types';
import Layers from '@charts-app/utils/z-index';
import styled from 'styled-components/macro';
import { v4 as uuidv4 } from 'uuid';

import { ComputationStep, Operation } from '@cognite/calculation-backend';
import { ChartWorkflowV2, ScheduledCalculation } from '@cognite/charts-lib';
import { Button } from '@cognite/cogs.js';

import { defaultTranslations } from '../translations';

import { validateSteps } from './calculations';
import { ConstantNodeDataDehydrated } from './Nodes/ConstantNode';
import { FunctionNodeDataDehydrated } from './Nodes/FunctionNode/FunctionNode';
import { OutputNodeDataDehydrated } from './Nodes/OutputNode';
import { SourceNodeDataDehydrated } from './Nodes/SourceNode';
import ReactFlowNodeEditor from './ReactFlowNodeEditor';
import { getStepsFromWorkflowReactFlow } from './transforms';
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
import { initializeParameterValues, rehydrateStoredFlow } from './utils';

type Props = {
  source: ChartWorkflowV2 | ScheduledCalculation;
  sourceType?: ChartWorkflowV2['type'] | ScheduledCalculation['type'];
  workflows: ChartWorkflowV2[];
  operations: Operation[];
  sources: SourceOption[];
  onClose: () => void;
  onUpdateWorkflow: (
    wf: ChartWorkflowV2 | ScheduledCalculation,
    steps: ComputationStep[],
    isValid: boolean
  ) => void;
  readOnly?: boolean;
  translations: typeof defaultTranslations;
  onErrorIconClick: (id: string) => void;
  calculationResult: ComponentProps<
    typeof ReactFlowNodeEditor
  >['calculationResult'];
  scheduledCalculationResult?: ScheduledCalculationData;
  onRemoveSourceClick: (
    source: ChartWorkflowV2 | ScheduledCalculation
  ) => () => void;
};

const ReactFlowNodeEditorContainer = ({
  source,
  sourceType,
  workflows = [],
  operations = [],
  sources,
  onClose,
  onUpdateWorkflow = () => {},
  readOnly = false,
  translations: t,
  onErrorIconClick,
  calculationResult,
  scheduledCalculationResult,
  onRemoveSourceClick,
}: Props) => {
  const [sourceDeleteModalOpen, setSourceDeleteModalOpen] = useState(false);

  /**
   * Delete scheduled calculation task and remove entry from firestore collection
   */
  const { mutateAsync: deleteScheduledCalculation } =
    useScheduledCalculationDeleteMutate();

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
  const [localWorkflow, setLocalWorkflow] = useState(source);

  /**
   * Overwrite local source state if new source prop is passed from outside
   */
  useEffect(() => {
    setLocalWorkflow(source);
  }, [source]);

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
    const newWorkflow = updateFlowSettings(
      localWorkflow as ChartWorkflowV2,
      updatedSettings
    );
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
        localWorkflow as ChartWorkflowV2,
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
        localWorkflow as ChartWorkflowV2,
        elementsToRemove
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleConnect = useCallback(
    (connection: Edge | Connection) => {
      const updatedWorkflow = makeConnectionInFlow(
        localWorkflow as ChartWorkflowV2,
        connection
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const updatedWorkflow = updateFlowEdge(
        localWorkflow as ChartWorkflowV2,
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
        localWorkflow as ChartWorkflowV2,
        nodeId,
        newNodeId
      );

      setSelectedElements([{ id: newNodeId, type: nodeType }]);
      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, setSelectedElements, localWorkflow, steps, isValid]
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      const updatedWorkflow = removeNodeInFlow(
        localWorkflow as ChartWorkflowV2,
        nodeId
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleSourceItemChange = useCallback(
    (nodeId: string, newSourceId: string, newType: string) => {
      const updatedWorkflow = updateSourceItemInFlow(
        localWorkflow as ChartWorkflowV2,
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
        localWorkflow as ChartWorkflowV2,
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
        localWorkflow as ChartWorkflowV2,
        nodeId,
        value
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleDeleteSource = useCallback(
    async (shouldDeleteTimeseries: boolean) => {
      await deleteScheduledCalculation({
        scheduledCalculationResult,
        shouldDeleteTimeseries,
      });
      onRemoveSourceClick(localWorkflow)();
      onClose();
    },
    [
      onRemoveSourceClick,
      onClose,
      localWorkflow,
      deleteScheduledCalculation,
      scheduledCalculationResult,
    ]
  );

  /**
   * Node handlers
   */
  const handleAddSourceNode = useCallback(
    (position: XYPosition, sourceNode: SourceOption) => {
      const nodeId = uuidv4();

      const newNode: Node<SourceNodeDataDehydrated> = {
        id: nodeId,
        type: NodeTypes.SOURCE,
        data: {
          selectedSourceId: sourceNode.value,
          type: sourceNode.type,
        },
        position,
      };

      const updatedWorkflow = addNodeInFlow(
        localWorkflow as ChartWorkflowV2,
        newNode
      );

      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, localWorkflow, steps, isValid]
  );

  const handleAddFunctionNode = useCallback(
    (position: XYPosition, operation: Operation, version: string) => {
      const nodeId = uuidv4();
      const nodeType = NodeTypes.FUNCTION;

      const selectedOperationVersion = operation.versions.find(
        (operationVersion) => operationVersion.version === version
      )!;

      const newNode: Node<FunctionNodeDataDehydrated> = {
        id: nodeId,
        type: nodeType,
        data: {
          selectedOperation: { op: operation.op, version },
          parameterValues: initializeParameterValues(selectedOperationVersion),
        },
        position,
      };

      const updatedWorkflow = addNodeInFlow(
        localWorkflow as ChartWorkflowV2,
        newNode
      );

      setSelectedElements([{ id: nodeId, type: nodeType }]);
      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, setSelectedElements, localWorkflow, steps, isValid]
  );

  const handleAddConstantNode = useCallback(
    (position: XYPosition) => {
      const nodeId = uuidv4();
      const nodeType = NodeTypes.CONSTANT;

      const newNode: Node<ConstantNodeDataDehydrated> = {
        id: nodeId,
        type: nodeType,
        data: { value: 1 },
        position,
      };

      const updatedWorkflow = addNodeInFlow(
        localWorkflow as ChartWorkflowV2,
        newNode
      );

      setSelectedElements([{ id: nodeId, type: nodeType }]);
      setLocalWorkflow(updatedWorkflow);
      onUpdateWorkflow(updatedWorkflow, steps, isValid);
    },
    [onUpdateWorkflow, setSelectedElements, localWorkflow, steps, isValid]
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

      const updatedWorkflow = addNodeInFlow(
        localWorkflow as ChartWorkflowV2,
        newNode
      );

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
        sourceType={sourceType}
        operations={operations}
        settings={localWorkflow.settings || { autoAlign: true }}
        color={localWorkflow.color}
        calculationResult={calculationResult}
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
        onErrorIconClick={onErrorIconClick}
        onDeleteSource={() => setSourceDeleteModalOpen(true)}
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
      {sourceDeleteModalOpen ? (
        <ScheduledCalculationDeleteModal
          onOk={handleDeleteSource}
          name={scheduledCalculationResult?.name || ''}
          onCancel={() => setSourceDeleteModalOpen(false)}
        />
      ) : null}
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
