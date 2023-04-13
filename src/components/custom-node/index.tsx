import { NodeProps } from 'reactflow';

import { BaseNode } from 'components/base-node';
import {
  TransformationNode,
  TransformationNodeData,
} from 'components/transformation-node';
import { WorkflowComponentType } from 'types/workflow';

export type NodeData<
  NodeType extends WorkflowComponentType,
  ExtraProps extends Record<string, any> = any
> = {
  type: NodeType;
  extraProps?: ExtraProps;
};

export type CustomNodeData = TransformationNodeData;

export const CustomNode = (props: NodeProps<CustomNodeData>): JSX.Element => {
  const { data } = props;

  switch (data.type) {
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
