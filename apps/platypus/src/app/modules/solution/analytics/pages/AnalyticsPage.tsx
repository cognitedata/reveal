import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const AnalyticsPage = () => {
  const { t } = useTranslation('solution');
  const renderHeader = () => {
    return <PageToolbar title={t('analytics_title', 'Analytics')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        <Placeholder
          componentName={t('analytics_title', 'Analytics')}
          componentDescription={t('updates_description', 'Analytics page.')}
          showGraphic={true}
        />
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
