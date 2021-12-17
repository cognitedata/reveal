import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const Pipelines = () => {
  const { t } = useTranslation('solution');

  return (
    <Placeholder
      componentName={t('pipelines', 'Pipelines')}
      componentDescription={t(
        'pipelines_description',
        'Overview of pipelines.'
      )}
      showGraphic={true}
    />
  );
};
