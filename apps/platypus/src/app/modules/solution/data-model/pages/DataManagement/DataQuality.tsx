import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const DataQuality = () => {
  const { t } = useTranslation('solution');

  return (
    <Placeholder
      componentName={t('data_quality', 'Data quality')}
      componentDescription={t('data_quality_description', 'Data quality page')}
      showGraphic={true}
    />
  );
};
