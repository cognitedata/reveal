import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';

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

  const { t } = useTranslation();

  return (
    <BaseNode icon="Folder" title={t('data-set', { postProcess: 'uppercase' })}>
      {extraProps?.dataSetId ?? data.type}
    </BaseNode>
  );
};
