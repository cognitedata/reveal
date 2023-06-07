import MonitoringAlertRow from '@charts-app/components/MonitoringAlert/MonitoringAlert';
import { LoadingRow } from '@charts-app/components/Common/SidebarElements';
import { Icon } from '@cognite/cogs.js';
import {
  MONITORING_SIDEBAR_NAV_FROM_ALERT_SIDEBAR,
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  // MONITORING_SIDEBAR_KEY,
  MONITORING_SIDEBAR_SHOW_ALERTS,
} from '@charts-app/utils/constants';
import { useSearchParam } from '@charts-app/hooks/navigation';
import { trackUsage } from '@charts-app/services/metrics';
import { MonitoringJob } from '@charts-app/components/MonitoringSidebar/types';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { useListAlerts } from './hooks';
import {
  AlertContainer,
  MonitoringSidebarBlueButton,
  JobContainer,
  DividerLine,
} from './elements';

const defaultTranslations = makeDefaultTranslations('Show all');

export const AlertsList = ({
  job,
  onViewMonitoringJobs,
}: {
  job: MonitoringJob;
  onViewMonitoringJobs: () => void;
}) => {
  const t = { ...defaultTranslations };
  const { data: alerts, isFetching } = useListAlerts(`${job.id}`);
  const [, setMonitoringShowAlerts] = useSearchParam(
    MONITORING_SIDEBAR_SHOW_ALERTS
  );
  const [, setMonitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );
  const [, setNavFromAlerts] = useSearchParam(
    MONITORING_SIDEBAR_NAV_FROM_ALERT_SIDEBAR
  );
  const handleShowAll = () => {
    setMonitoringShowAlerts('true');
    setMonitoringJobIdParam(`${job.id}`);
    setNavFromAlerts('true');
    onViewMonitoringJobs();
    trackUsage('Sidebar.Alerting.ShowAllAlerts', {
      monitoringJob: job.externalId,
    });
  };
  return (
    <JobContainer>
      <DividerLine />
      {isFetching ? (
        <LoadingRow lines={4} />
      ) : (
        alerts?.slice(0, 5).map((alert) => {
          return (
            <AlertContainer key={alert.id}>
              <MonitoringAlertRow alert={alert} jobId={`${job.id}`} />
            </AlertContainer>
          );
        })
      )}
      <MonitoringSidebarBlueButton onClick={handleShowAll}>
        {t['Show all']}
        <Icon type="ArrowRight" size={12} />
      </MonitoringSidebarBlueButton>
    </JobContainer>
  );
};
