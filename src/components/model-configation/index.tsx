import {
  Body,
  Flex,
  Title,
  Checkbox,
  RadioGroup,
  Radio,
  Colors,
} from '@cognite/cogs.js';

import { useTranslation } from 'common';
import { QUICK_MATCH_CONFIGURE_MODEL_PAGE_WIDTH } from 'common/constants';
import FieldMapping from 'components/field-mapping';
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
      <Section>
        <SectionTitle level={5}>
          {t('model-configuration-fields-header')}
        </SectionTitle>
        <SectionBody>{t('model-configuration-fields-body')}</SectionBody>
        <Flex>
          <FieldMapping
            sourceType={sourceType}
            targetType="assets"
            modelFieldMapping={modelFieldMapping}
            setModelFieldMapping={setModelFieldMapping}
          />
        </Flex>
      </Section>
      <Section>
        <SectionTitle>
          {t('model-configuration-model-type-header')}
        </SectionTitle>
        <SectionBody>{t('model-configuration-model-type-body')}</SectionBody>
        <Checkbox
          checked={supervisedMode}
          onChange={(e) => setSupervisedMode(e.target.checked)}
          label={t('model-configuration-supervised-mode')}
        />
      </Section>
      <Section>
        <SectionTitle>
          {t('model-configuration-model-score-header')}
        </SectionTitle>
        <SectionBody>{t('model-configuration-model-score-body')}</SectionBody>
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
      </Section>
      <Section>
        <SectionTitle>{t('model-configuration-scope-header')}</SectionTitle>
        <SectionBody>{t('model-configuration-scope-desc')}</SectionBody>
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
      </Section>
    </Container>
  );
}

const Section = styled(Flex).attrs({ gap: 8, direction: 'column' })``;

const SectionTitle = styled(Title).attrs({ level: 5 })`
  color: ${Colors['text-icon--status-neutral']};
`;

const SectionBody = styled(Body).attrs({ level: 2 })``;

const Container = styled(Flex).attrs({ direction: 'column' })`
  width: ${QUICK_MATCH_CONFIGURE_MODEL_PAGE_WIDTH}px;

  ${Section}:not(:first-child) {
    border-top: 1px solid ${Colors['border--interactive--default']};
    margin-top: 16px;
    padding-top: 16px;
  }
`;
