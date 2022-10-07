import { useMemo, useState } from 'react';

import { Button, Flex } from '@cognite/cogs.js';
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
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

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

  const navigate = useNavigate();

  const [selectedTransformation, setSelectedTransformation] =
    useState<string>();

  const { data: transformations } = useTransformationList();
  const { mutate: createTransformation, isLoading: isCreatingTransformation } =
    useCreateTransformation();

  const transformationList = useMemo(() => {
    return collectPages<TransformationRead>(transformations);
  }, [transformations]);

  const transformationOptions = useMemo(() => {
    return transformationList.map(({ name }) => ({ label: name, value: name }));
  }, [transformationList]);

  const selectedTransformationId = transformationList.find(
    ({ name }) => name === selectedTransformation
  )?.id;

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
        {selectedTransformationId !== undefined && (
          <Flex gap={8}>
            <Button
              block
              onClick={() =>
                navigate(
                  createLink(`/transformations/${selectedTransformationId}`)
                )
              }
            >
              {t('view')}
            </Button>
            <Button block icon="Play">
              {t('run')}
            </Button>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};
