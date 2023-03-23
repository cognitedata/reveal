import { Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import FieldMapping from 'components/field-mapping';
import Step from 'components/step';
import { ModelMapping } from 'context/QuickMatchContext';
import { Pipeline, useUpdatePipeline } from 'hooks/entity-matching-pipelines';
import { pipelineSourceToAPIType } from '../sources';

type ConfigurePipelineProps = {
  pipeline: Pipeline;
};

const ConfigurePipeline = ({
  pipeline,
}: ConfigurePipelineProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate } = useUpdatePipeline();

  const handleUpdateMatchFields = (modelMapping: ModelMapping): void => {
    mutate({
      id: pipeline.id,
      modelParameters: {
        featureType: pipeline.modelParameters?.featureType,
        matchFields: modelMapping.map(({ source, target }) => ({
          source: source === undefined ? '' : source,
          target: target === undefined ? '' : target,
        })),
      },
    });
  };

  return (
    <Step isCentered title={t('configure-pipeline-step-title', { step: 3 })}>
      <Flex direction="column">
        <Step.Section>
          <Step.SectionHeader
            subtitle={t('model-configuration-fields-body')}
            title={t('model-configuration-fields-header')}
          />
          <FieldMapping
            sourceType={pipelineSourceToAPIType[pipeline.sources.resource]}
            targetType="assets"
            modelFieldMapping={pipeline.modelParameters?.matchFields ?? []}
            setModelFieldMapping={handleUpdateMatchFields}
          />
        </Step.Section>
      </Flex>
    </Step>
  );
};

export default ConfigurePipeline;
