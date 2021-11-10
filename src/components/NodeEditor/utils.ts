import { Edge, Elements, Node } from 'react-flow-renderer';
import { Connection } from '@cognite/connect';
import {
  ChartWorkflow,
  ChartWorkflowV1,
  ChartWorkflowV2,
} from 'models/chart/types';
import { node as SourceNode } from 'components/Nodes/SourceReference';
import { node as ConstantNode } from 'components/Nodes/Constant';
import { node as FunctionNode } from 'components/Nodes/DSPToolboxFunction';
import { node as OutputNode } from 'components/Nodes/OutputSeries';
import { getConfigFromDspFunction } from 'utils/transforms';
import { NodeTypes, SourceOption } from 'models/node-editor/types';

export const isWorkflowRunnable = (workflow: ChartWorkflow) => {
  if (!workflow.version) {
    const { nodes } = workflow;
    return (
      nodes && nodes.length > 0 && nodes.filter((node) => !node.outputPins)
    );
  }
  if (workflow.version === 'v2') {
    const elements = workflow.flow?.elements;
    return elements && elements.length > 0;
  }
  return false;
};

export const convertWorkflowToV1 = (
  workflow: ChartWorkflowV2
): Partial<ChartWorkflowV1> => {
  if (!workflow.flow) {
    return { version: '', nodes: [], connections: [] };
  }

  const { elements } = workflow.flow;
  const nodes = (elements as Elements)
    .filter((el) => el.type !== 'default')
    .map((el) => {
      switch (el.type) {
        case NodeTypes.SOURCE: {
          const sourceItem =
            (el.data.sourceOptions as SourceOption[]).find(
              (s) => s.value === el.data.selectedSourceId
            ) || el.data.sourceOptions[0];

          return {
            id: el.id,
            ...SourceNode,
            title: sourceItem.label,
            subtitle: sourceItem.type,
            functionData: {
              type: sourceItem.type,
              sourceId: el.data.selectedSourceId,
            },
            ...(el as Node).position,
          };
        }
        case NodeTypes.CONSTANT:
          return {
            id: el.id,
            ...ConstantNode,
            functionData: {
              value: el.data.value,
            },
            ...(el as Node).position,
          };
        case NodeTypes.FUNCTION: {
          const inputPins = (
            getConfigFromDspFunction(el.data.toolFunction).input || []
          )
            .filter((input) => input.pin)
            .map((input) => ({
              id: input.field,
              title: input.name,
              types: input.types,
            }));

          const outputPins = (
            getConfigFromDspFunction(el.data.toolFunction).output || []
          ).map((output) => ({
            id: `out-${output.field}`,
            title: output.name,
            type: output.type,
          }));
          return {
            id: el.id,
            ...FunctionNode,
            title: el.data.toolFunction.name,
            inputPins,
            outputPins,
            functionData: {
              toolFunction: el.data.toolFunction,
              ...el.data.functionData,
            },
            ...(el as Node).position,
          };
        }
        case NodeTypes.OUTPUT:
          return {
            id: el.id,
            ...OutputNode,
            ...(el as Node).position,
          };
        default:
          return el;
      }
    });

  const connections: Record<string, Connection> = {};

  (
    (elements as Elements).filter((el) => el.type === 'default') as Edge[]
  ).forEach((el) => {
    connections[el.id] = {
      id: el.id,
      outputPin: { nodeId: el.source, pinId: el.sourceHandle },
      inputPin: { nodeId: el.target, pinId: el.targetHandle },
    };
  });

  return { version: '', nodes, connections };
};
