import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';

export type EntityMatchingNodeData = NodeData<
  'entity-matching',
  {
    id?: string;
  }
>;

export const EntityMatchingNode = ({
  data,
}: NodeProps<EntityMatchingNodeData>): JSX.Element => {
  const { extraProps } = data;

  return <BaseNode>{extraProps?.id ?? data.type}</BaseNode>;
};
