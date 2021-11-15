import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../../components/Layouts/PageContentLayout';

export const MonitoringPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Monitoring" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        MONITORING & PROFILING (WIP...)
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
