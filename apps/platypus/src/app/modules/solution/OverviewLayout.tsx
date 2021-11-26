import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Icon } from '@cognite/cogs.js';

import { Schema, Solution } from '@platypus/platypus-core';
import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import { SideBarMenu } from '@platypus-app/components/Navigations/SideBarMenu';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

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

export const OverviewLayout = ({
  solution,
  schema,
}: {
  solution: Solution;
  schema: Schema;
}) => {
  const { t } = useTranslation('overview');
  const renderPageContent = () => {
    return (
      <Switch>
        <Route exact path="*/analytics">
          <Analytics solution={solution} />
        </Route>
        <Route exact path="*/updates">
          <UpdatesPage solution={solution} />
        </Route>
        <Route exact path="*">
          <OverviewPage solution={solution} schema={schema} />
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
