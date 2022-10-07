import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';

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

  const { t } = useTranslation();

  return (
    <BaseNode
      icon="Pipeline"
      title={t('extraction-pipeline', { postProcess: 'uppercase' })}
    >
      {extraProps?.id ?? data.type}
    </BaseNode>
  );
};
