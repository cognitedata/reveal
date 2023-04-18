import { NodeProps } from 'reactflow';

import { BaseNode } from 'components/base-node';
import { WorkflowComponentType } from 'types/workflow';
import { useTranslation } from 'common';
import { WORKFLOW_COMPONENT_ICON_TYPES } from 'utils/workflow';

export type NodeData<
  NodeType extends WorkflowComponentType,
  ExtraProps extends Record<string, any> = any
> = {
  type: NodeType;
  extraProps?: ExtraProps;
};

export type CustomNodeData =
  | NodeData<'transformation', {}>
  | NodeData<'webhook', {}>
  | NodeData<'workflow', {}>;

export const CustomNode = ({
  data,
  selected,
}: NodeProps<CustomNodeData>): JSX.Element => {
  const { t } = useTranslation();

  return (
    <BaseNode
      description={t('no-configuration')}
      icon={WORKFLOW_COMPONENT_ICON_TYPES[data.type]}
      selected={selected}
      title={t(`component-title-${data.type}`, { postProcess: 'uppercase' })}
    />
  );
};
