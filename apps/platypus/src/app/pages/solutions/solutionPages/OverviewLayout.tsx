import { SideBarMenuWithPageLayout } from '../../layouts/SideBarMenuWithPageLayout';

import { ReactComponent as Home } from './icons/home.svg';
import { ReactComponent as ChartPie } from './icons/chartpie.svg';
import { ReactComponent as Newspaper } from './icons/newspaper.svg';
import { Route, Switch } from 'react-router-dom';
import { OverviewPage } from './overviewPages/OverviewPage';
import { UpdatesPage } from './overviewPages/UpdatesPage';
import { AnalyticsPage } from './overviewPages/AnalyticsPage';

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

  return (
    <SideBarMenuWithPageLayout
      sideBarMenuItems={[
        {
          icon: <Home />,
          page: 'overview',
          slug: ``,
          tooltip: 'Overview',
        },
        {
          icon: <ChartPie />,
          page: 'overview',
          slug: `analytics`,
          tooltip: 'Analytics',
        },
        {
          icon: <Newspaper />,
          page: 'overview',
          slug: `updates`,
          tooltip: 'Update',
        },
      ]}
    >
      {renderPageContent()}
    </SideBarMenuWithPageLayout>
  );
};
