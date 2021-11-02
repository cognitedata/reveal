import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const MonitoringPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Monitoring" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>MONITORING & PROFILING (WIP...)</div>
    </PageWithHeaderLayout>
  );
};
