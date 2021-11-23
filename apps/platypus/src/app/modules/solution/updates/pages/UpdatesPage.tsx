import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const UpdatesPage = () => {
  const { t } = useTranslation('SolutionUpdates');

  const renderHeader = () => {
    return <PageToolbar title={t('solution_updates_title', 'Updates')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>UPDATES (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
