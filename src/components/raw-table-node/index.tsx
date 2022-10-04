import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';

export type RawNodeData = NodeData<
  'raw-table',
  {
    database?: string;
    table?: string;
  }
>;

export const RawTableNode = ({ data }: NodeProps<RawNodeData>): JSX.Element => {
  const { extraProps } = data;

  return <BaseNode>{extraProps?.database ?? data.type}</BaseNode>;
};
