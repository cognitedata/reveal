import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const OverviewPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Overview" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>OVERVIEW (WIP...)</div>
    </PageWithHeaderLayout>
  );
};
