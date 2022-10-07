import { useMemo, useState } from 'react';

import { Flex } from '@cognite/cogs.js';
import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';
import {
  useCreateTransformation,
  useTransformationList,
} from 'hooks/transformation';
import { TransformationRead } from 'types/transformation';
import { collectPages } from 'utils';
import SelectWithCreate from 'components/select-with-create';

export type TransformationNodeData = NodeData<
  'transformation',
  {
    transformationId?: number;
  }
>;

export const TransformationNode = (
  _: NodeProps<TransformationNodeData>
): JSX.Element => {
  const { t } = useTranslation();

  const [selectedTransformation, setSelectedTransformation] =
    useState<string>();

  const { data: transformations } = useTransformationList();
  const { mutate: createTransformation, isLoading: isCreatingTransformation } =
    useCreateTransformation();

  const transformationOptions = useMemo(() => {
    const list = collectPages<TransformationRead>(transformations);
    return list.map(({ name }) => ({ label: name, value: name }));
  }, [transformations]);

  const handleTransformationCreate = (value: string) => {
    createTransformation({ externalId: `tr-${value}`, name: value });
  };

  const handleTransformationSelect = (value?: string) => {
    if (value !== selectedTransformation) {
      setSelectedTransformation(undefined);
    }
    setSelectedTransformation(value);
  };

  return (
    <BaseNode
      description={t('no-configuration')}
      icon="Code"
      title={t('transformation', { postProcess: 'uppercase' })}
    >
      <Flex direction="column" gap={8}>
        <SelectWithCreate
          className="nodrag"
          loading={isCreatingTransformation}
          onClear={() => handleTransformationSelect(undefined)}
          onCreate={handleTransformationCreate}
          onSelect={handleTransformationSelect}
          optionLabelProp="label"
          options={transformationOptions}
          titleI18nKey="transformation"
          value={selectedTransformation}
        />
      </Flex>
    </BaseNode>
  );
};
