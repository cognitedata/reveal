import 'graphiql/graphiql.min.css';

import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { QueryExplorer } from '../components/QueryExplorer';

export const QueryExplorerPage = () => {
  const { t } = useTranslation('SolutionMonitoring');

  const renderHeader = () => {
    return <PageToolbar title={t('query_explorer_title', 'Query explorer')} />;
  };

  const FETCHER_API = 'https://api.spacex.land/graphql/';

  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        <QueryExplorer apiUrl={FETCHER_API} />
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
