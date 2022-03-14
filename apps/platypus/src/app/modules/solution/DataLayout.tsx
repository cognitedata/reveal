import { lazy, Suspense } from 'react';

import { Route, Switch } from 'react-router-dom';
import { Icon } from '@cognite/cogs.js';

import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import { SideBarMenu } from '@platypus-app/components/Navigations/SideBarMenu';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

const DataModelPage = lazy<any>(() =>
  import('./data-model/pages/DataModelPage').then((module) => ({
    default: module.DataModelPage,
  }))
);

const DataManagementPage = lazy<any>(() =>
  import('./data-model/pages/DataManagementPage').then((module) => ({
    default: module.DataManagementPage,
  }))
);

const QueryExplorerPage = lazy<any>(() =>
  import('./query-explorer/pages/QueryExplorerPage').then((module) => ({
    default: module.QueryExplorerPage,
  }))
);

export const DataLayout = () => {
  const { t } = useTranslation('SolutionDataModel');

  const renderPageContent = () => {
    return (
      <Switch>
        <Route exact path="*/data-management/:subSolutionPage?">
          <Suspense fallback={<Spinner />}>
            <DataManagementPage />
          </Suspense>
        </Route>
        <Route exact path="*/query-explorer">
          <Suspense fallback={<Spinner />}>
            <QueryExplorerPage />
          </Suspense>
        </Route>
        <Route exact path="*">
          <Suspense fallback={<Spinner />}>
            <DataModelPage />
          </Suspense>
        </Route>
      </Switch>
    );
  };

  const sideBarMenuItems = [
    {
      icon: <Icon type="GraphTree" />,
      page: 'data',
      slug: '',
      tooltip: t('data_model_title', 'Data model'),
    },
    {
      icon: <Icon type="DataSource" />,
      page: 'data',
      slug: 'data-management/preview',
      tooltip: t('data_management_title', 'Data management'),
    },
    {
      icon: <Icon type="Search" />,
      page: 'data',
      slug: 'query-explorer',
      tooltip: t('query_explorer_title', 'Query Explorer'),
      splitter: true,
    },
  ];

  return (
    <PageLayout>
      <PageLayout.Navigation>
        <SideBarMenu items={sideBarMenuItems} />
      </PageLayout.Navigation>
      <PageLayout.Content>{renderPageContent()}</PageLayout.Content>
    </PageLayout>
  );
};
