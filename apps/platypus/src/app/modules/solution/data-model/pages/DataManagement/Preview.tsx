import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const Preview = () => {
  const { t } = useTranslation('solution');

  return (
    <Placeholder
      componentName={t('preview', 'Preview page')}
      componentDescription={t(
        'preview_description',
        'This page will display preview of the data.'
      )}
      showGraphic={true}
    />
  );
};
