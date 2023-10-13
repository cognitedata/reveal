import { useState } from 'react';

import { Collapse } from 'antd';

import { Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../../../common';
import FieldMapping from '../../../../components/field-mapping';
import Radio from '../../../../components/radio';
import RadioBox from '../../../../components/radio-box';
import Step from '../../../../components/step';
import {
  EMFeatureType,
  ModelMapping,
} from '../../../../context/QuickMatchContext';
import {
  Pipeline,
  useUpdatePipeline,
} from '../../../../hooks/entity-matching-pipelines';
import { pipelineSourceToAPIType } from '../sources';

type ConfigurePipelineProps = {
  pipeline: Pipeline;
};

const ConfigurePipeline = ({
  pipeline,
}: ConfigurePipelineProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate } = useUpdatePipeline();

  const [shouldShowAdvancedOptions, setShouldShowAdvancedOptions] = useState(
    !!pipeline.modelParameters?.featureType &&
      pipeline.modelParameters?.featureType !== 'simple'
  );

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

  const handleUpdateFeatureType = (featureType: EMFeatureType): void => {
    mutate({
      id: pipeline.id,
      modelParameters: {
        featureType,
        matchFields: pipeline.modelParameters?.matchFields,
      },
    });
  };

  const handleUpdateGenerateRules = (shouldGenerateRules: boolean): void => {
    mutate({
      id: pipeline.id,
      generateRules: shouldGenerateRules,
    });
  };

  const handleUpdateModelType = (isSupervisedModel: boolean): void => {
    mutate({
      id: pipeline.id,
      useExistingMatches: isSupervisedModel,
    });
  };

  return (
    <Step
      isCentered
      title={t('configure-pipeline-step-title', { step: 3 })}
      dataTestId="pipeline-configure-step"
    >
      <Flex direction="column" data-testid="pipeline-configure-step-content">
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
        <Step.Section>
          <Step.SectionHeader
            subtitle={t('model-configuration-model-score-body')}
            title={t('model-configuration-model-score-header')}
          />
          <Radio.Group
            value={pipeline.modelParameters?.featureType}
            onChange={(e) =>
              handleUpdateFeatureType(e.target.value as EMFeatureType)
            }
          >
            <Flex direction="column" gap={4}>
              <Radio
                value="simple"
                name="simple"
                title={t('model-simple-title')}
                subtitle={t('model-simple-subtitle')}
                description={t('model-simple-description')}
              />
              <Radio.Collapse
                activeKey={shouldShowAdvancedOptions ? 'content' : undefined}
                expandIcon={() => <></>}
                ghost
              >
                <Collapse.Panel header={<></>} key="content">
                  <Flex direction="column" gap={4}>
                    <Radio
                      value="bigram"
                      name="bigram"
                      title={t('model-bigram-title')}
                      description={t('model-bigram-description')}
                    />
                    <Radio
                      value="fwb"
                      name="fwb"
                      title={t('model-frequency-weighted-bigram-title')}
                      description={t(
                        'model-frequency-weighted-bigram-description'
                      )}
                    />
                    <Radio
                      value="bigramextratokenizers"
                      name="bigramextratokenizers"
                      title={t('model-bigram-with-extra-tokenizers-title')}
                      description={t(
                        'model-bigram-with-extra-tokenizers-description'
                      )}
                    />
                    <Radio
                      value="bigramcombo"
                      name="bigramcombo"
                      title={t('model-combined-title')}
                      description={t('model-combined-description')}
                    />
                  </Flex>
                </Collapse.Panel>
              </Radio.Collapse>
              <div>
                <Button
                  icon={shouldShowAdvancedOptions ? 'ChevronUp' : 'ChevronDown'}
                  iconPlacement="right"
                  onClick={() =>
                    setShouldShowAdvancedOptions((prevState) => !prevState)
                  }
                  type="ghost-accent"
                >
                  {t(
                    shouldShowAdvancedOptions
                      ? 'hide-advanced-options'
                      : 'show-advanced-options'
                  )}
                </Button>
              </div>
            </Flex>
          </Radio.Group>
        </Step.Section>
        <Step.Section>
          <Step.SectionHeader
            subtitle={t('model-configuration-model-type-body')}
            title={t('model-configuration-model-type-header')}
          />
          <Radio.Group
            onChange={(e) =>
              handleUpdateModelType(e.target.value === 'supervised')
            }
            value={pipeline.useExistingMatches ? 'supervised' : 'unsupervised'}
          >
            <Flex>
              <RadioBox
                checked={!pipeline.useExistingMatches}
                value="unsupervised"
              >
                {t('unsupervised-model')}
              </RadioBox>
              <RadioBox
                checked={pipeline.useExistingMatches}
                value="supervised"
              >
                {t('supervised-model')}
              </RadioBox>
            </Flex>
          </Radio.Group>
        </Step.Section>
        <Step.Section>
          <Step.SectionHeader
            subtitle={t('model-configuration-generate-rules-subtitle')}
            title={t('model-configuration-generate-rules-title')}
          />
          <Radio.Group
            onChange={(e) =>
              handleUpdateGenerateRules(e.target.value === 'generate')
            }
            value={pipeline.generateRules ? 'generate' : 'do-not-generate'}
          >
            <Flex>
              <RadioBox checked={pipeline.generateRules} value="generate">
                {t('generate-rules')}
              </RadioBox>
              <RadioBox
                checked={!pipeline.generateRules}
                value="do-not-generate"
              >
                {t('do-not-generate-rules')}
              </RadioBox>
            </Flex>
          </Radio.Group>
        </Step.Section>
      </Flex>
    </Step>
  );
};

export default ConfigurePipeline;
