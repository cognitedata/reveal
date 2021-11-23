import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const QueryExplorerPage = () => {
  const { t } = useTranslation('SolutionMonitoring');

  const renderHeader = () => {
    return <PageToolbar title={t('query_explorer_title', 'Query explorer')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>QUERY EXPLORER (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
