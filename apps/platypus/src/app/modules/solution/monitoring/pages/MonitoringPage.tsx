import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const MonitoringPage = () => {
  const { t } = useTranslation('SolutionMonitoring');

  const renderHeader = () => {
    return <PageToolbar title={t('monitoring_title', 'Monitoring')} />;
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
