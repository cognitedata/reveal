import { Body, Colors, Flex } from '@cognite/cogs.js';
import { useQuery } from '@tanstack/react-query';
import { DELETE_KEY_CODES, MAX_ZOOM, MIN_ZOOM, useTranslation } from 'common';
import { Controls } from 'components/controls';
import { FlowBuilderContainer } from 'components/flow-builder';
import { RunNodeRenderer } from 'components/run-node/RunNodeRenderer';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { ComponentType, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Edge,
  NodeProps,
  ReactFlow,
  SelectionMode,
} from 'reactflow';
import styled from 'styled-components';
import { ProcessNode, WorkflowBuilderNodeType } from 'types';
import { computeLayout } from 'utils/layout';

type RunCanvasProps = {};

const NODE_TYPES: Record<
  Extract<WorkflowBuilderNodeType, 'process'>,
  ComponentType<NodeProps>
> = {
  process: RunNodeRenderer,
};

const RunCanvas = ({}: RunCanvasProps): JSX.Element => {
  const { t } = useTranslation();

  const { selectedExecution } = useWorkflowBuilderContext();

  const edgeTypes = [] as any;

  const { data: layout } = useQuery(
    ['workflows', 'run-layout', selectedExecution?.id],
    () => computeLayout(selectedExecution!),
    {
      enabled: !!selectedExecution,
    }
  );

  const [nodes, edges] = useMemo<[ProcessNode[], Edge[]]>(() => {
    if (!layout) {
      return [[], []];
    }

    const n: ProcessNode[] = [];
    const e: Edge[] = [];

    layout.children?.forEach(({ id, x, y }) => {
      const workflowTask = selectedExecution?.workflowDefinition.tasks.find(
        ({ externalId }) => externalId === id
      );
      if (workflowTask && x !== undefined && y !== undefined) {
        n.push({
          data: {
            processExternalId: id,
            processType: workflowTask.type,
            processDescription: workflowTask.description ?? '',
            processProps: {},
          },
          id,
          position: { x, y },
          type: 'process',
        });
      }
    });

    layout.edges?.forEach(({ id, sources, targets }) => {
      const sourceExternalId = sources[0];
      const targetExternalId = targets[0];

      e.push({
        id,
        source: sourceExternalId,
        target: targetExternalId,
        type: 'customEdge',
      });
    });

    return [n, e];
  }, [layout, selectedExecution]);

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
