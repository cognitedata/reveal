import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';

export type DataSetNodeData = NodeData<
  'data-set',
  {
    dataSetId?: number;
  }
>;

export const DataSetNode = ({
  data,
}: NodeProps<DataSetNodeData>): JSX.Element => {
  const { extraProps } = data;

  return <BaseNode>{extraProps?.dataSetId ?? data.type}</BaseNode>;
};
