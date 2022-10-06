import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';

export type RawNodeData = NodeData<
  'raw-table',
  {
    database?: string;
    table?: string;
  }
>;

export const RawTableNode = ({ data }: NodeProps<RawNodeData>): JSX.Element => {
  const { extraProps } = data;

  const { t } = useTranslation();

  return (
    <BaseNode
      icon="DataTable"
      title={t('raw-table', { postProcess: 'uppercase' })}
    >
      {extraProps?.database ?? data.type}
    </BaseNode>
  );
};
