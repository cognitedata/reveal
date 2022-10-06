import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';

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

  const { t } = useTranslation();

  // FIXME: update icon

  return (
    <BaseNode
      icon="Network"
      title={t('engineering-diagram', { postProcess: 'uppercase' })}
    >
      {extraProps?.id ?? data.type}
    </BaseNode>
  );
};
