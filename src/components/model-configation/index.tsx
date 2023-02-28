import { Body, Flex, Title } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { useQuickMatchContext } from 'context/QuickMatchContext';

export default function ModelConfiguration() {
  const { t } = useTranslation();
  const { modelFieldMapping } = useQuickMatchContext();
  return (
    <Flex direction="column">
      <Title level={4}>{t('model-configuration-header')}</Title>
      <Title level={5}>{t('model-configuration-description-header')}</Title>
      <Body>{t('model-configuration-description-body')}</Body>
      <Flex>
        {Object.entries(modelFieldMapping).map(([k, v]) => (
          <span key={k}>{`${k} -> ${v}`}</span>
        ))}
      </Flex>
    </Flex>
  );
}
