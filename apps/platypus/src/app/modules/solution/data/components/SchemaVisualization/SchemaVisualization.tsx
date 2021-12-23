import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const SchemaVisualization = () => {
  const { t } = useTranslation('SchemaVisualization');

  return (
    <div data-testid="Schema_visualization">
      <PageToolbar title={t('preview_title', 'Preview')} titleLevel={6} />
      <Placeholder
        componentName={t('visualizer', 'Data model visualizer')}
        componentDescription={t(
          'visualizer_description',
          'It will provide you a better view on the data model built'
        )}
        showGraphic={false}
      />
    </div>
  );
};
