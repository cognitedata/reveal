import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const PopulationPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Population pipelines" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>POPULATION PIPELINES PAGE is coming soon...</div>
    </PageWithHeaderLayout>
  );
};
