import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const PopulationPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Population pipelines" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>POPULATION PIPELINES (WIP...)</div>
    </PageWithHeaderLayout>
  );
};
