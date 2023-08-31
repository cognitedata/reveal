import { useRef, useState, useCallback, useEffect, ReactNode } from 'react';
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
  NodeTypesType,
} from 'react-flow-renderer';

import AlertIcon from '@charts-app/components/AlertIcon/AlertIcon';
import { usePrevious } from '@charts-app/hooks/usePrevious';
import { WorkflowState } from '@charts-app/models/calculation-results/types';
import { trackUsage } from '@charts-app/services/metrics';
import { compareVersions } from 'compare-versions';

import { Operation } from '@cognite/calculation-backend';
import { Chip, Flex } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { ScheduledCalculationButton } from '../../ScheduledCalculation/ScheduledCalculationButton';
import { defaultTranslations } from '../translations';

import AddButton, { AddMenu } from './AddButton';
import { CanvasContext } from './CanvasContext';
import EditorControls from './EditorControls/EditorControls';
import EditorToolbar from './EditorToolbar/EditorToolbar';
import {
  NodeEditorContainer,
  ContextMenu,
  ScheduleToolbar,
  DeleteSourceButton,
} from './elements';
import ConstantNode from './Nodes/ConstantNode';
import FunctionNode from './Nodes/FunctionNode/FunctionNode';
import OutputNode from './Nodes/OutputNode';
import SourceNode from './Nodes/SourceNode';
import { ScheduledCalculationSummary } from './ScheduledCalculationSummary';
import { NodeTypes, SourceOption, NodeDataVariants } from './types';
import { getOutputNodePosition } from './utils';

type Props = {
  id?: string;
  position?: [number, number];
  zoom?: number;
  flowElements: Elements<NodeDataVariants>;
  sources: SourceOption[];
  color?: string;
  sourceType?: 'workflow' | 'scheduledCalculation';
  operations: Operation[];
  settings: {
    autoAlign: boolean;
  };
  calculationResult?: WorkflowState | undefined;
  readOnly?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  isValid: boolean;
  onSaveSettings: (updatedSettings: Props['settings']) => void;
  onElementsRemove: (elementsToRemove: Elements<NodeDataVariants>) => void;
  onConnect: (connection: Edge | Connection) => void;
  onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => void;
  onNodeDragStop: (_: React.MouseEvent, node: Node<NodeDataVariants>) => void;
  onAddSourceNode: (position: XYPosition, source: SourceOption) => void;
  onAddConstantNode: (position: XYPosition) => void;
  onAddFunctionNode: (
    position: XYPosition,
    operation: Operation,
    version: string
  ) => void;
  onAddOutputNode: (position: XYPosition) => void;
  onMove: (transform: FlowTransform) => void;
  onDeleteSource?: () => void;
  translations: typeof defaultTranslations;
  onErrorIconClick: (id: string) => void;
};

const NODE_TYPES: NodeTypesType = {
  [NodeTypes.SOURCE]: SourceNode as unknown as ReactNode,
  [NodeTypes.FUNCTION]: FunctionNode as unknown as ReactNode,
  [NodeTypes.CONSTANT]: ConstantNode as unknown as ReactNode,
  [NodeTypes.OUTPUT]: OutputNode as unknown as ReactNode,
};

const ReactFlowNodeEditor = ({
  id = '1',
  position = [0, 0],
  zoom = 1,
  flowElements,
  sources,
  color,
  sourceType,
  operations,
  settings,
  calculationResult,
  readOnly = false,
  onSaveSettings,
  onElementsRemove,
  onConnect,
  onEdgeUpdate,
  onNodeDragStop,
  onAddSourceNode,
  onAddConstantNode,
  onAddFunctionNode,
  onAddOutputNode,
  onMove,
  onDeleteSource,
  translations: t,
  onErrorIconClick,
}: Props) => {
  const { isEnabled: isPersistenceCalcEnabled } = useFlag(
    'CHARTS_PERSISTENCE_CALC',
    {
      fallback: false,
      forceRerender: true,
    }
  );

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
    (transform: FlowTransform | undefined) => {
      transform && onMove(transform);
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
    (event: React.MouseEvent, operation: Operation) => {
      const nodePosition = getPosition(contextMenuPosition || event);

      /**
       * For the time being (until the UI for version selection is ready)
       * we default to using the latest available version
       * when adding a new function to your calculation
       */
      const latestVersion = operation.versions
        .map(({ version }) => version)
        .sort(compareVersions)
        .reverse()[0];

      onAddFunctionNode(nodePosition, operation, latestVersion);
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

  /**
   * Set canvas context
   */
  const canvasRect = reactFlowWrapper?.current?.getBoundingClientRect();
  const canvasSize = {
    height: canvasRect?.height,
    width: canvasRect?.width,
  };

  return (
    <CanvasContext.Provider value={canvasSize}>
      <NodeEditorContainer ref={reactFlowWrapper} onClick={handleEditorClick}>
        {isRenderable && (
          <ReactFlow
            defaultPosition={position}
            defaultZoom={zoom}
            elements={flowElements}
            nodeTypes={NODE_TYPES}
            onLoad={setReactFlowInstance}
            onElementsRemove={onElementsRemove}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={() => {
              setContextMenuPosition(undefined);
            }}
            nodesConnectable={sourceType !== 'scheduledCalculation'}
            nodesDraggable={sourceType !== 'scheduledCalculation'}
            onPaneContextMenu={(e) => {
              e.preventDefault();
              setContextMenuPosition(e);
            }}
            onMoveEnd={handleMove}
          >
            <Background variant={BackgroundVariant.Dots} />
          </ReactFlow>
        )}
        {isRenderable && (
          <>
            {isPersistenceCalcEnabled &&
              sourceType === 'scheduledCalculation' && (
                <ScheduledCalculationSummary workflowId={id} color={color} />
              )}
            <EditorToolbar>
              {!readOnly && (
                <AddButton
                  elements={flowElements}
                  sources={sources}
                  operations={operations}
                  addSourceNode={addSourceNode}
                  addFunctionNode={addFunctionNode}
                  addConstantNode={addConstantNode}
                  addOutputNode={addOutputNode}
                  translations={t}
                />
              )}
              <EditorControls
                settings={settings}
                onSaveSettings={onSaveSettings}
                readOnly={readOnly}
                translations={t}
                horizontal
              />
              {isPersistenceCalcEnabled &&
              sourceType === 'scheduledCalculation' ? (
                <Flex>
                  <DeleteSourceButton
                    type="ghost"
                    size="small"
                    icon="Delete"
                    onClick={onDeleteSource}
                  />
                </Flex>
              ) : null}

              {calculationResult ? (
                <>
                  {calculationResult.loading && (
                    <div style={{ display: 'flex' }}>
                      <AlertIcon
                        type="default"
                        icon="Loader"
                        value="Loading"
                        size="small"
                      />
                    </div>
                  )}
                  {calculationResult.error &&
                    calculationResult.status === 'Success' && (
                      <div style={{ display: 'flex' }}>
                        <AlertIcon
                          icon="ErrorFilled"
                          type="danger"
                          value="Error"
                          size="small"
                          onClick={() => onErrorIconClick(id)}
                        />
                      </div>
                    )}
                  {!calculationResult.error &&
                    !!calculationResult.warnings?.length &&
                    calculationResult.status === 'Success' && (
                      <div style={{ display: 'flex' }}>
                        <AlertIcon
                          icon="WarningFilled"
                          size="small"
                          type="warning"
                          value={`Warning${
                            calculationResult.warnings.length > 1
                              ? `s (${calculationResult.warnings.length})`
                              : ''
                          }`}
                          onClick={() => onErrorIconClick(id)}
                        />
                      </div>
                    )}
                </>
              ) : (
                ''
              )}
            </EditorToolbar>
            {isPersistenceCalcEnabled && sourceType === 'workflow' ? (
              <ScheduleToolbar>
                <ScheduledCalculationButton workflowId={id} />
              </ScheduleToolbar>
            ) : null}
            {isPersistenceCalcEnabled &&
            sourceType === 'scheduledCalculation' ? (
              <ScheduleToolbar>
                <Chip
                  size="small"
                  type="neutral"
                  label={t['Running on Schedule']}
                />
              </ScheduleToolbar>
            ) : null}
          </>
        )}
        {contextMenuPosition && sourceType !== 'scheduledCalculation' && (
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
              translations={t}
            />
          </ContextMenu>
        )}
      </NodeEditorContainer>
    </CanvasContext.Provider>
  );
};

export default ReactFlowNodeEditor;
