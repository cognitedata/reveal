import { SideBarMenu } from '../../../components/Navigations/SideBarMenu';
import { PageLayout } from '../../../components/Layouts/PageLayout';

import { Route, Switch } from 'react-router-dom';
import { OverviewPage } from './overviewPages/OverviewPage';
import { UpdatesPage } from './overviewPages/UpdatesPage';
import { AnalyticsPage } from './overviewPages/AnalyticsPage';

import { ReactComponent as Home } from './icons/home.svg';
import { ReactComponent as ChartPie } from './icons/chartpie.svg';
import { ReactComponent as Newspaper } from './icons/newspaper.svg';

export const OverviewLayout = () => {
  const renderPageContent = () => {
    return (
      <Switch>
        <Route exact path="*/analytics">
          <AnalyticsPage />
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
      icon: <Home />,
      page: 'overview',
      slug: '',
      tooltip: 'Overview',
    },
    {
      icon: <ChartPie />,
      page: 'overview',
      slug: 'analytics',
      tooltip: 'Analytics',
    },
    {
      icon: <Newspaper />,
      page: 'overview',
      slug: 'updates',
      tooltip: 'Update',
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
