import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';

export const OverviewPage = () => {
  const { t } = useTranslation('solution');

  const renderHeader = () => {
    return (
      <PageToolbar title={`${t('solution_overview_title', 'Overview')}`} />
    );
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        <Placeholder
          componentName={t('overview', 'Overview page')}
          componentDescription={t(
            'ui_editor_description',
            'This page will give you a good overview of your solution.'
          )}
          showGraphic={true}
        />
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
