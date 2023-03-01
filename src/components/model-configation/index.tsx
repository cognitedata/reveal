import {
  Body,
  Flex,
  Title,
  Checkbox,
  RadioGroup,
  Radio,
} from '@cognite/cogs.js';
import { useTranslation } from 'common';
import FieldMapping from 'components/field-mapping';
import {
  EMFeatureType,
  Scope,
  useQuickMatchContext,
} from 'context/QuickMatchContext';

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
    <Flex direction="column" gap={12}>
      <Title level={4}>{t('model-configuration-fields-header')}</Title>
      <Body>
        <p>{t('model-configuration-fields-body-p1')}</p>
        <p>{t('model-configuration-fields-body-p2')}</p>
      </Body>
      <Flex>
        <FieldMapping
          sourceType={sourceType}
          targetType="assets"
          modelFieldMapping={modelFieldMapping}
          setModelFieldMapping={setModelFieldMapping}
        />
      </Flex>
      <Title level={4}>{t('model-configuration-model-type-header')}</Title>
      <Body>
        <p>{t('model-configuration-model-type-body-p1')}</p>
      </Body>
      <Body>
        <Checkbox
          checked={supervisedMode}
          onChange={(e) => setSupervisedMode(e.target.checked)}
          label={t('model-configuration-supervised-mode')}
        />
      </Body>
      <Title level={4}>{t('model-configuration-model-score-header')}</Title>
      <Body>
        <p>{t('model-configuration-model-score-body-p1')}</p>
      </Body>

      <RadioGroup
        name="featureType"
        value={featureType}
        onChange={(e) => setFeatureType(e.target.value as EMFeatureType)}
      >
        <Radio
          value="simple"
          name="simple"
          label={t('model-configuration-model-score-simple-header')}
        />
        <span>{t('model-configuration-model-score-simple-desc')}</span>
        <Radio
          value="bigram"
          name="bigram"
          label={t('model-configuration-model-score-bigram-header')}
        />
        <span>{t('model-configuration-model-score-bigram-desc')}</span>

        <Radio
          value="fwb"
          name="fwb"
          label={t('model-configuration-model-score-fwb-header')}
        />
        <span>{t('model-configuration-model-score-fwb-desc')}</span>

        <Radio
          value="bigramextratokenizers"
          name="bigramextratokenizers"
          label={t(
            'model-configuration-model-score-bigram-extra-tokenizers-header'
          )}
        />
        <span>
          {t('model-configuration-model-score-bigram-extra-tokenizers-header')}
        </span>

        <Radio
          value="bigramcombo"
          name="bigramcombo"
          label={t('model-configuration-model-score-combined-header')}
        />
        <span>{t('model-configuration-model-score-combined-desc')}</span>
      </RadioGroup>

      <Title level={4}>{t('model-configuration-scope-header')}</Title>
      <Body>
        <p>{t('model-configuration-scope-desc')}</p>
      </Body>
      <RadioGroup
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
    </Flex>
  );
}
