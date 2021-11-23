import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const OverviewPage = () => {
  const { t } = useTranslation('SolutionMonitoring');

  const renderHeader = () => {
    return <PageToolbar title={t('solution_overview_title', 'Overview')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>OVERVIEW (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
