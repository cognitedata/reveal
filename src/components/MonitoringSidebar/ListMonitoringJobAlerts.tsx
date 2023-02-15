import { useSearchParam } from 'hooks/navigation';
import { useTranslations } from 'hooks/translations';
import React from 'react';
import { MONITORING_SIDEBAR_HIGHLIGHTED_JOB } from 'utils/constants';
import { makeDefaultTranslations } from 'utils/translations';
import MonitoringAlertRow from 'components/MonitoringAlert/MonitoringAlert';
import styled from 'styled-components';
import { useListAlerts, useMonitoringFoldersWithJobs } from './hooks';
import ListMonitoringJobPreview from './ListMonitoringJobPreview';
// import ListMonitoringJobPreview from './ListMonitoringJobPreview';
import { MonitoringFolderJobs, MonitoringJob } from './types';

const defaultTranslation = makeDefaultTranslations('Alert history for: ');
const ListMonitoringJobAlerts = () => {
  const [monitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );
  const {
    data: folders,
    // isFetched,
    // isFetching,
  } = useMonitoringFoldersWithJobs();

  const { data: alerts } = useListAlerts(monitoringJobIdParam || '');
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar').t,
  };

  const job =
    monitoringJobIdParam &&
    folders?.reduce((acc: any, folder: MonitoringFolderJobs) => {
      if (acc === undefined) {
        const foundJob = folder.tasks.find((task: MonitoringJob) => {
          return task.id === Number(monitoringJobIdParam);
        });
        if (foundJob) {
          return foundJob;
        }
      }
      return acc;
    }, undefined);

  return (
    <>
      {t['Alert history for: ']}
      {job && (
        <ListMonitoringJobPreview
          monitoringJob={job}
          showHighlightedBorder={false}
          showLastAlert={false}
        />
      )}
      {alerts?.map((alert) => (
        <WrappedAlert key={alert.id}>
          <MonitoringAlertRow
            alert={alert}
            jobId={monitoringJobIdParam || ''}
          />
        </WrappedAlert>
      ))}
    </>
  );
};

const WrappedAlert = styled.div`
  margin-top: 1em;
`;

export default ListMonitoringJobAlerts;
