import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';

export type TransformationNodeData = NodeData<
  'transformation',
  {
    transformationId?: number;
  }
>;

export const TransformationNode = ({
  data,
}: NodeProps<TransformationNodeData>): JSX.Element => {
  const { extraProps } = data;

  return <BaseNode>{extraProps?.transformationId ?? data.type}</BaseNode>;
};
