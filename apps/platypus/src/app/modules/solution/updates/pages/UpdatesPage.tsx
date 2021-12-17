import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';

export const UpdatesPage = () => {
  const { t } = useTranslation('solution');

  const renderHeader = () => {
    return <PageToolbar title={t('solution_updates_title', 'Updates')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        <Placeholder
          componentName={t('updates_title', 'Updates')}
          componentDescription={t(
            'updates_description',
            'All solutions related updates will come up on this page.'
          )}
          showGraphic={true}
        />
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
