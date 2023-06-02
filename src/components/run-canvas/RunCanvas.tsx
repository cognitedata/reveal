import { Body, Colors, Flex } from '@cognite/cogs.js';
import { DELETE_KEY_CODES, MAX_ZOOM, MIN_ZOOM, useTranslation } from 'common';
import { Controls } from 'components/controls';
import { FlowBuilderContainer } from 'components/flow-builder';
import { ProcessNodeRenderer } from 'components/process-node/ProcessNodeRenderer';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { ComponentType } from 'react';
import {
  Background,
  BackgroundVariant,
  NodeProps,
  ReactFlow,
  SelectionMode,
} from 'reactflow';
import styled from 'styled-components';
import { WorkflowBuilderNodeType } from 'types';

type RunCanvasProps = {};

const NODE_TYPES: Record<
  Extract<WorkflowBuilderNodeType, 'process'>,
  ComponentType<NodeProps>
> = {
  process: ProcessNodeRenderer,
};

const RunCanvas = ({}: RunCanvasProps): JSX.Element => {
  const { t } = useTranslation();

  const { selectedExecution } = useWorkflowBuilderContext();

  const nodes = [] as any;
  const edges = [] as any;
  const edgeTypes = [] as any;

  if (!selectedExecution) {
    return (
      <StyledEmptyStateContainer>
        <Body level={3} muted>
          {t('select-a-run-to-start')}
        </Body>
      </StyledEmptyStateContainer>
    );
  }

  return (
    <FlowBuilderContainer>
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
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </FlowBuilderContainer>
  );
};

export const StyledEmptyStateContainer = styled(Flex).attrs({
  alignItems: 'center',
  direction: 'column',
  gap: 8,
  justifyContent: 'center',
})`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  height: 100%;
  padding: 72px;
  width: 100%;
`;

export default RunCanvas;
