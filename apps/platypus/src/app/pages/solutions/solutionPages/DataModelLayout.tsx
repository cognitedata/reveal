import { Route, Switch } from 'react-router-dom';

import { ReactComponent as DataModel } from './icons/datamodel.svg';
import { ReactComponent as DataPreview } from './icons/datapreview.svg';
import { ReactComponent as QueryExplorer } from './icons/queryexplorer.svg';
import { ReactComponent as PopulationPipelines } from './icons/populationpipelines.svg';
import { ReactComponent as Monitoring } from './icons/monitoring.svg';

import { PageLayout } from '../../../components/Layouts/PageLayout';
import { DatamodelPage } from './datamodelPages/DatamodelPage';
import { DatapreviewPage } from './datamodelPages/DatapreviewPage';
import { QueryExplorerPage } from './datamodelPages/QueryExplorerPage';
import { PopulationPage } from './datamodelPages/PopulationPage';
import { MonitoringPage } from './datamodelPages/MonitoringPage';
import { SideBarMenu } from '../../../components/Navigations/SideBarMenu';

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
      icon: <DataModel />,
      page: 'data-model',
      slug: '',
      tooltip: 'Data model',
    },
    {
      icon: <DataPreview />,
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
