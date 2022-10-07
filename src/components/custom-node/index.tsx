import { NodeProps } from 'react-flow-renderer';

import { CanvasBlockType } from 'components/canvas-block';
import { RawNodeData, RawTableNode } from 'components/raw-table-node';
import { BaseNode } from 'components/base-node';
import {
  TransformationNode,
  TransformationNodeData,
} from 'components/transformation-node';
import { DataSetNode, DataSetNodeData } from 'components/data-set-node';
import {
  EntityMatchingNode,
  EntityMatchingNodeData,
} from 'components/entity-matching-node';
import {
  ExtractionPipelineNode,
  ExtractionPipelineNodeData,
} from 'components/extraction-pipeline-node';
import {
  EngineeringDiagramNode,
  EngineeringDiagramNodeData,
} from 'components/engineering-diagram-node';

export type NodeData<
  NodeType extends CanvasBlockType,
  ExtraProps extends Record<string, any> = any
> = {
  type: NodeType;
  extraProps?: ExtraProps;
};

export type CustomNodeData =
  | DataSetNodeData
  | EntityMatchingNodeData
  | ExtractionPipelineNodeData
  | RawNodeData
  | TransformationNodeData
  | EngineeringDiagramNodeData;

export const CustomNode = (props: NodeProps<CustomNodeData>): JSX.Element => {
  const { data } = props;

  switch (data.type) {
    case 'data-set':
      return <DataSetNode {...(props as NodeProps<DataSetNodeData>)} />;
    case 'engineering-diagram':
      return (
        <EngineeringDiagramNode
          {...(props as NodeProps<EngineeringDiagramNodeData>)}
        />
      );
    case 'entity-matching':
      return (
        <EntityMatchingNode {...(props as NodeProps<EntityMatchingNodeData>)} />
      );
    case 'extraction-pipeline':
      return (
        <ExtractionPipelineNode
          {...(props as NodeProps<ExtractionPipelineNodeData>)}
        />
      );
    case 'raw-table':
      return <RawTableNode {...(props as NodeProps<RawNodeData>)} />;
    case 'transformation':
      return (
        <TransformationNode {...(props as NodeProps<TransformationNodeData>)} />
      );
    default:
      return (
        <BaseNode icon="Favorite" title="unknown">
          unknown type
        </BaseNode>
      );
  }
};
