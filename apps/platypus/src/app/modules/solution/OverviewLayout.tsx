import { Route, Switch } from 'react-router-dom';
import { OverviewPage } from './overview/pages/OverviewPage';
import { UpdatesPage } from './updates/pages/UpdatesPage';

import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import { SideBarMenu } from '@platypus-app/components/Navigations/SideBarMenu';
import { lazy } from 'react';
import { Icon } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

const Analytics = lazy(() =>
  import('./analytics/pages/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  }))
);

export const OverviewLayout = () => {
  const { t } = useTranslation('overview');
  const renderPageContent = () => {
    return (
      <Switch>
        <Route exact path="*/analytics">
          <Analytics />
        </Route>
        <Route exact path="*/updates">
          <UpdatesPage />
        </Route>
        <Route exact path="*">
          <OverviewPage />
        </Route>
      </Switch>
    );
  };

  const sideBarMenuItems = [
    {
      icon: <Icon type="Home" />,
      page: 'overview',
      slug: '',
      tooltip: t('overview_menu', 'Overview'),
    },
    {
      icon: <Icon type="LineChart" />,
      page: 'overview',
      slug: 'analytics',
      tooltip: t('analytics_menu', 'Analytics'),
    },
    {
      icon: <Icon type="Document" />,
      page: 'overview',
      slug: 'updates',
      tooltip: t('updates_menu', 'Updates'),
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
