import { Route, Switch } from 'react-router-dom';
import { Icon } from '@cognite/cogs.js';

import { ReactComponent as QueryExplorer } from './data-model/icons/queryexplorer.svg';
import { ReactComponent as PopulationPipelines } from './data-model/icons/populationpipelines.svg';
import { ReactComponent as Monitoring } from './data-model/icons/monitoring.svg';

import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import { SideBarMenu } from '@platypus-app/components/Navigations/SideBarMenu';

import { DatamodelPage } from './data-model/pages/DatamodelPage';
import { DatapreviewPage } from './data-model/pages/DatapreviewPage';
import { QueryExplorerPage } from './query-explorer/pages/QueryExplorerPage';
import { PopulationPage } from './population/pages/PopulationPage';
import { MonitoringPage } from './monitoring/pages/MonitoringPage';

export const DataModelLayout = () => {
  const renderPageContent = () => {
    return (
      <Switch>
        <Route exact path="*/datapreview">
          <DatapreviewPage />
        </Route>
        <Route exact path="*/query-explorer">
          <QueryExplorerPage />
        </Route>
        <Route exact path="*/population-pipelines">
          <PopulationPage />
        </Route>
        <Route exact path="*/monitoring-profiling">
          <MonitoringPage />
        </Route>
        <Route exact path="*">
          <DatamodelPage />
        </Route>
      </Switch>
    );
  };

  const sideBarMenuItems = [
    {
      icon: <Icon type="GraphTree" />,
      page: 'data-model',
      slug: '',
      tooltip: 'Data model',
    },
    {
      icon: <Icon type="Datasource" />,
      page: 'data-model',
      slug: 'datapreview',
      tooltip: 'Data preview',
    },
    {
      icon: <QueryExplorer />,
      page: 'data-model',
      slug: 'query-explorer',
      tooltip: 'Query explorer',
    },
    {
      icon: <PopulationPipelines />,
      page: 'data-model',
      slug: 'population-pipelines',
      tooltip: 'Population pipelines',
    },
    {
      icon: <Monitoring />,
      page: 'data-model',
      slug: 'monitoring-profiling',
      tooltip: 'Monitoring & profiling',
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
