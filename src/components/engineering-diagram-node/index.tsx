import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';

export type EngineeringDiagramNodeData = NodeData<
  'engineering-diagram',
  {
    id?: string;
  }
>;

export const EngineeringDiagramNode = ({
  data,
}: NodeProps<EngineeringDiagramNodeData>): JSX.Element => {
  const { extraProps } = data;

  return <BaseNode>{extraProps?.id ?? data.type}</BaseNode>;
};
