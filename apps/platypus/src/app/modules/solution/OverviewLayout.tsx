import { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Icon } from '@cognite/cogs.js';

import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import { SideBarMenu } from '@platypus-app/components/Navigations/SideBarMenu';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

const Analytics = lazy<any>(() =>
  import('./analytics/pages/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  }))
);

const UpdatesPage = lazy<any>(() =>
  import('./updates/pages/UpdatesPage').then((module) => ({
    default: module.UpdatesPage,
  }))
);

const OverviewPage = lazy<any>(() =>
  import('./overview/pages/OverviewPage').then((module) => ({
    default: module.OverviewPage,
  }))
);

export const OverviewLayout = () => {
  const { t } = useTranslation('overview');
  const renderPageContent = () => {
    return (
      <Switch>
        <Route exact path="*/analytics">
          <Suspense fallback={<Spinner />}>
            <Analytics />
          </Suspense>
        </Route>
        <Route exact path="*/updates">
          <Suspense fallback={<Spinner />}>
            <UpdatesPage />
          </Suspense>
        </Route>
        <Route exact path="*">
          <Suspense fallback={<Spinner />}>
            <OverviewPage />
          </Suspense>
        </Route>
      </Switch>
    );
  };

  const sideBarMenuItems = [
    {
      icon: <Icon type="Home" />,
      page: 'overview',
      slug: '',
      tooltip: t('overview_title', 'Overview'),
    },
    {
      icon: <Icon type="LineChart" />,
      page: 'overview',
      slug: 'analytics',
      tooltip: t('analytics_title', 'Analytics'),
    },
    {
      icon: <Icon type="Document" />,
      page: 'overview',
      slug: 'updates',
      tooltip: t('updates_title', 'Updates'),
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
