import { PageLayout } from '../../layouts/PageLayout';

import { ReactComponent as Home } from './icons/home.svg';
import { ReactComponent as ChartPie } from './icons/chartpie.svg';
import { ReactComponent as Newspaper } from './icons/newspaper.svg';

export const OverviewPage = () => {
  const renderPageContent = () => {
    return <div>Overview Page Content</div>;
  };
  return (
    <PageLayout
      pageTitle="Overview"
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
      pageContent={renderPageContent()}
    />
  );
};
