import { useState } from 'react';

import { useTranslation } from '@entity-matching-app/common';
import FieldMapping from '@entity-matching-app/components/field-mapping';
import Radio from '@entity-matching-app/components/radio';
import RadioBox from '@entity-matching-app/components/radio-box';
import Step from '@entity-matching-app/components/step';
import {
  EMFeatureType,
  useQuickMatchContext,
} from '@entity-matching-app/context/QuickMatchContext';
import { Collapse } from 'antd';

import { Button, Flex } from '@cognite/cogs.js';

const ConfigureModel = (): JSX.Element => {
  const { t } = useTranslation();

  const [shouldShowAdvancedOptions, setShouldShowAdvancedOptions] =
    useState(false);

  const {
    sourceType,
    matchFields: modelFieldMapping,
    setModelFieldMapping,
    supervisedMode,
    setSupervisedMode,
    featureType,
    setFeatureType,
    scope,
    setScope,
    generateRules,
    setGenerateRules,
  } = useQuickMatchContext();

  return (
    <Step isCentered title={t('configure-model-step-title', { step: 3 })}>
      <Flex direction="column">
        <Step.Section>
          <Step.SectionHeader
            subtitle={t('model-configuration-fields-body')}
            title={t('model-configuration-fields-header')}
          />
          <FieldMapping
            sourceType={sourceType}
            targetType="assets"
            modelFieldMapping={modelFieldMapping}
            setModelFieldMapping={setModelFieldMapping}
          />
        </Step.Section>
        <Step.Section>
          <Step.SectionHeader
            subtitle={t('model-configuration-model-score-body')}
            title={t('model-configuration-model-score-header')}
          />
          <Radio.Group
            value={featureType}
            onChange={(e) => setFeatureType(e.target.value as EMFeatureType)}
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
            onChange={(e) => setSupervisedMode(e.target.value === 'supervised')}
            value={supervisedMode ? 'supervised' : 'unsupervised'}
          >
            <Flex>
              <RadioBox checked={!supervisedMode} value="unsupervised">
                {t('unsupervised-model')}
              </RadioBox>
              <RadioBox checked={supervisedMode} value="supervised">
                {t('supervised-model')}
              </RadioBox>
            </Flex>
          </Radio.Group>
        </Step.Section>
        <Step.Section>
          <Step.SectionHeader
            subtitle={t('model-configuration-scope-desc')}
            title={t('model-configuration-scope-header')}
          />
          <Radio.Group onChange={(e) => setScope(e.target.value)} value={scope}>
            <Flex>
              <RadioBox checked={scope === 'all'} value="all">
                {t('model-configuration-scope-all')}
              </RadioBox>
              <RadioBox checked={scope === 'unmatched'} value="unmatched">
                {t('model-configuration-scope-unmatched-only')}
              </RadioBox>
            </Flex>
          </Radio.Group>
        </Step.Section>
        <Step.Section>
          <Step.SectionHeader
            title={t('model-configuration-generate-rule-header')}
            subtitle={t('model-configuration-generate-rule-desc')}
          />

          <Radio.Group
            onChange={(e) => setGenerateRules(e.target.value)}
            value={generateRules}
          >
            <Flex>
              <RadioBox checked={generateRules} value={true}>
                {t('model-configuration-generate-rule-do')}
              </RadioBox>
              <RadioBox checked={!generateRules} value={false}>
                {t('model-configuration-generate-rule-dont')}
              </RadioBox>
            </Flex>
          </Radio.Group>
        </Step.Section>
      </Flex>
    </Step>
  );
};

export default ConfigureModel;
