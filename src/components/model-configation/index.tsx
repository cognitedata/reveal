import { Body, Flex, Title } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import FieldMapping from 'components/field-mapping';
import { useQuickMatchContext } from 'context/QuickMatchContext';

export default function ModelConfiguration() {
  const { t } = useTranslation();
  const { sourceType, modelFieldMapping, setModelFieldMapping } =
    useQuickMatchContext();
  return (
    <Flex direction="column">
      <Title level={4}>{t('model-configuration-header')}</Title>
      <Title level={5}>{t('model-configuration-description-header')}</Title>
      <Body>
        <p>{t('model-configuration-description-body-p1')}</p>
        <p>{t('model-configuration-description-body-p2')}</p>
      </Body>
      <Flex>
        <FieldMapping
          sourceType={sourceType}
          targetType="assets"
          modelFieldMapping={modelFieldMapping}
          setModelFieldMapping={setModelFieldMapping}
        />
      </Flex>
    </Flex>
  );
}
