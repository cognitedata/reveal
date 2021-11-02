import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const AnalyticsPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Analytics" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>ANALYTICS (WIP...)</div>
    </PageWithHeaderLayout>
  );
};
