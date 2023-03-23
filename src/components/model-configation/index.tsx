import { Flex, Checkbox, RadioGroup, Radio } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import { QUICK_MATCH_CONFIGURE_MODEL_PAGE_WIDTH } from 'common/constants';
import FieldMapping from 'components/field-mapping';
import Step from 'components/step';
import {
  EMFeatureType,
  Scope,
  useQuickMatchContext,
} from 'context/QuickMatchContext';
import styled from 'styled-components';

export default function ModelConfiguration() {
  const { t } = useTranslation();
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
  } = useQuickMatchContext();
  return (
    <Container>
      <Step.Section>
        <Step.SectionHeader
          subtitle={t('model-configuration-fields-body')}
          title={t('model-configuration-fields-header')}
        />
        <Flex>
          <FieldMapping
            sourceType={sourceType}
            targetType="assets"
            modelFieldMapping={modelFieldMapping}
            setModelFieldMapping={setModelFieldMapping}
          />
        </Flex>
      </Step.Section>
      <Step.Section>
        <Step.SectionHeader
          subtitle={t('model-configuration-model-type-body')}
          title={t('model-configuration-model-type-header')}
        />
        <Checkbox
          checked={supervisedMode}
          onChange={(e) => setSupervisedMode(e.target.checked)}
          label={t('model-configuration-supervised-mode')}
        />
      </Step.Section>
      <Step.Section>
        <Step.SectionHeader
          subtitle={t('model-configuration-model-score-body')}
          title={t('model-configuration-model-score-header')}
        />
        <RadioGroup
          name="featureType"
          value={featureType}
          onChange={(e) => setFeatureType(e.target.value as EMFeatureType)}
        >
          <Radio
            value="simple"
            name="simple"
            label={t('model-configuration-model-score-simple')}
          />
          <Radio
            value="bigram"
            name="bigram"
            label={t('model-configuration-model-score-bigram')}
          />
          <Radio
            value="fwb"
            name="fwb"
            label={t('model-configuration-model-score-fwb')}
          />
          <Radio
            value="bigramextratokenizers"
            name="bigramextratokenizers"
            label={t('model-configuration-model-score-bigram-extra-tokenizers')}
          />
          <Radio
            value="bigramcombo"
            name="bigramcombo"
            label={t('model-configuration-model-score-combined')}
          />
        </RadioGroup>
      </Step.Section>
      <Step.Section>
        <Step.SectionHeader
          subtitle={t('model-configuration-scope-desc')}
          title={t('model-configuration-scope-header')}
        />
        <RadioGroup
          direction="horizontal"
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as Scope)}
        >
          <Radio
            value="all"
            name="all"
            label={t('model-configuration-scope-all')}
          />
          <Radio
            value="unmatched"
            name="unmatched"
            label={t('model-configuration-scope-unmatched-only')}
          />
        </RadioGroup>
      </Step.Section>
    </Container>
  );
}

const Container = styled(Flex).attrs({ direction: 'column' })`
  width: ${QUICK_MATCH_CONFIGURE_MODEL_PAGE_WIDTH}px;
`;
