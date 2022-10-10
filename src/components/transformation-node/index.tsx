import { useCallback, useMemo } from 'react';

import { Button, Flex } from '@cognite/cogs.js';
import { NodeProps, useReactFlow } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';
import {
  useCreateTransformation,
  useTransformationList,
} from 'hooks/transformation';
import { TransformationRead } from 'types/transformation';
import { collectPages } from 'utils';
import SelectWithCreate, {
  SelectWithCreateOption,
} from 'components/select-with-create';
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

export type TransformationNodeData = NodeData<
  'transformation',
  {
    transformationId?: number;
    transformationName?: string;
  }
>;

export const TransformationNode = ({
  data,
  id,
}: NodeProps<TransformationNodeData>): JSX.Element => {
  const { extraProps = {} } = data;
  const { transformationId: selectedTransformationId } = extraProps;

  const { t } = useTranslation();

  const navigate = useNavigate();

  const { setNodes } = useReactFlow();

  const { data: transformations } = useTransformationList();
  const {
    mutateAsync: createTransformation,
    isLoading: isCreatingTransformation,
  } = useCreateTransformation();

  const transformationOptions = useMemo(() => {
    const list = collectPages<TransformationRead>(transformations);
    return list.map(({ id, name }) => ({ label: name, value: id }));
  }, [transformations]);

  const updateTransformationNode = useCallback(
    (extraProps: TransformationNodeData['extraProps']) => {
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          const { id: testId } = node;
          if (testId === id) {
            return { ...node, data: { ...node.data, extraProps } };
          }
          return node;
        });
      });
    },
    [id, setNodes]
  );

  const handleTransformationClear = () => {
    updateTransformationNode({
      transformationId: undefined,
      transformationName: undefined,
    });
  };

  const handleTransformationCreate = (labelToCreate: string) => {
    createTransformation({
      externalId: `tr-${labelToCreate}`,
      name: labelToCreate,
    }).then(({ id, name }) => {
      updateTransformationNode({
        transformationId: id,
        transformationName: name,
      });
    });
  };

  const handleTransformationSelect = (
    value: number,
    option: SelectWithCreateOption<number>
  ) => {
    if (value !== selectedTransformationId) {
      updateTransformationNode({
        transformationId: value,
        transformationName: option.label,
      });
    }
  };

  return (
    <BaseNode
      description={t('no-configuration')}
      icon="Code"
      title={t('transformation', { postProcess: 'uppercase' })}
    >
      <Flex direction="column" gap={8}>
        <SelectWithCreate<number>
          className="nodrag"
          loading={isCreatingTransformation}
          onClear={handleTransformationClear}
          onCreate={handleTransformationCreate}
          onSelect={handleTransformationSelect}
          optionLabelProp="label"
          options={transformationOptions}
          titleI18nKey="transformation"
          value={selectedTransformationId}
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
