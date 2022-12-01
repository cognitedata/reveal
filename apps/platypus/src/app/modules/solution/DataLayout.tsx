import { lazy, Suspense } from 'react';

import { Outlet, Route, Routes, useParams } from 'react-router-dom';

import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import {
  SideBarItem,
  SideBarMenu,
} from '@platypus-app/components/Navigations/SideBarMenu';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';

const DataModelPage = lazy<any>(() =>
  import('./data-model/pages/DataModelPage').then((module) => ({
    default: module.DataModelPage,
  }))
);

const DataManagementPage = lazy<any>(() =>
  import('./data-management/DataManagementPage').then((module) => ({
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
  const { dataModelExternalId } = useParams<{
    dataModelExternalId: string;
  }>();

  const sideBarMenuItems: SideBarItem[] = [
    {
      icon: 'GraphTree',
      slug: '',
      tooltip: t('data_model_title', 'Data model'),
    },
    {
      icon: 'DataSource',
      slug: 'data-management/preview',
      tooltip: t('data_management_title', 'Data management'),
    },
    {
      icon: 'Search',
      slug: 'query-explorer',
      tooltip: t('query_explorer_title', 'Query Explorer'),
      splitter: true,
    },
  ];

  return (
    <Routes>
      <Route
        element={
          <StyledPageWrapper data-testid="data_model_page_wrapper">
            <PageLayout>
              <PageLayout.Navigation>
                <SideBarMenu items={sideBarMenuItems} />
              </PageLayout.Navigation>
              <PageLayout.Content>
                <Suspense fallback={<Spinner />}>
                  <Outlet />
                </Suspense>
              </PageLayout.Content>
            </PageLayout>
          </StyledPageWrapper>
        }
      >
        <Route
          index
          element={<DataModelPage dataModelExternalId={dataModelExternalId} />}
        />
        <Route
          path="/data"
          element={
            <>
              <Outlet />
            </>
          }
        >
          <Route
            index
            element={
              <DataModelPage dataModelExternalId={dataModelExternalId} />
            }
          />
          <Route
            path="data-management/:subSolutionPage"
            element={
              <DataManagementPage dataModelExternalId={dataModelExternalId} />
            }
          />
          <Route
            path="query-explorer"
            element={
              <QueryExplorerPage dataModelExternalId={dataModelExternalId} />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};
