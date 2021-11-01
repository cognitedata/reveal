import { PageLayout } from '../../layouts/PageLayout';

import { ReactComponent as DataModel } from './icons/datamodel.svg';
import { ReactComponent as DataPreview } from './icons/datapreview.svg';
import { ReactComponent as QueryExplorer } from './icons/queryexplorer.svg';
import { ReactComponent as PopulationPipelines } from './icons/populationpipelines.svg';
import { ReactComponent as Monitoring } from './icons/monitoring.svg';

export const DataModelPage = () => {
  const renderPageContent = () => {
    return <div>Data Model Page Content</div>;
  };
  return (
    <PageLayout
      pageTitle="Data Model"
      sideBarMenuItems={[
        {
          icon: <DataModel />,
          page: 'data-model',
          slug: '',
        },
        {
          icon: <DataPreview />,
          page: 'data-model',
          slug: `datapreview`,
        },
        {
          icon: <QueryExplorer />,
          page: 'data-model',
          slug: `query-explorer`,
        },
        {
          icon: <PopulationPipelines />,
          page: 'data-model',
          slug: `population-pipelines`,
        },
        {
          icon: <Monitoring />,
          page: 'data-model',
          slug: `monitoring-profiling`,
        },
      ]}
      pageContent={renderPageContent()}
    />
  );
};
