import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';

export type ExtractionPipelineNodeData = NodeData<
  'extraction-pipeline',
  {
    id?: string;
  }
>;

export const ExtractionPipelineNode = ({
  data,
}: NodeProps<ExtractionPipelineNodeData>): JSX.Element => {
  const { extraProps } = data;

  return <BaseNode>{extraProps?.id ?? data.type}</BaseNode>;
};
