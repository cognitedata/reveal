import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';

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

  const { t } = useTranslation();

  return (
    <BaseNode
      description={t('no-configuration')}
      icon="Code"
      title={t('transformation', { postProcess: 'uppercase' })}
    >
      {extraProps?.transformationId ?? data.type}
    </BaseNode>
  );
};
