import { NodeProps } from 'reactflow';

import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';
import { PROCESS_ICON, ProcessNodeData } from 'types';

export const ProcessNode = ({
  data,
  selected,
}: NodeProps<ProcessNodeData>): JSX.Element => {
  const { t } = useTranslation();

  return (
    <BaseNode
      description={t('no-configuration')}
      icon={PROCESS_ICON[data.processType]}
      selected={selected}
      title={t(`component-title-${data.processType}`, {
        postProcess: 'uppercase',
      })}
    />
  );
};
