import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';

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

  const { t } = useTranslation();

  return (
    <BaseNode
      icon="Network"
      title={t('entity-matching', { postProcess: 'uppercase' })}
    >
      {extraProps?.id ?? data.type}
    </BaseNode>
  );
};
