import React, { useState } from 'react';

import styled from 'styled-components';

import { useSearchParam } from '../../hooks/navigation';
import { useTranslations } from '../../hooks/translations';
import { MONITORING_SIDEBAR_HIGHLIGHTED_JOB } from '../../utils/constants';
import { makeDefaultTranslations } from '../../utils/translations';
import { MonitoringSidebarBlueButton } from '../AlertingSidebar/elements';
import MonitoringAlertRow from '../MonitoringAlert/MonitoringAlert';

import { useListAlerts, useMonitoringFoldersWithJobs } from './hooks';
import ListMonitoringJobPreview from './ListMonitoringJobPreview';
// import ListMonitoringJobPreview from './ListMonitoringJobPreview';
import { MonitoringFolderJobs, MonitoringJob } from './types';

const defaultTranslation = makeDefaultTranslations(
  'Alert history for: ',
  'Show more'
);
const MINIMUM_ALERTS_TO_SHOW = 20;
const ListMonitoringJobAlerts = () => {
  const [monitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );
  const { data: folders } = useMonitoringFoldersWithJobs('monitoring-sidebar');

  const [showAll, setShowAll] = useState(false);
  const onShowAllAlerts = () => {
    setShowAll(true);
  };
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

  const limit = showAll === false ? MINIMUM_ALERTS_TO_SHOW : alerts?.length;

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
      {alerts?.slice(0, limit).map((alert) => (
        <WrappedAlert key={alert.id}>
          <MonitoringAlertRow
            alert={alert}
            jobId={monitoringJobIdParam || ''}
          />
        </WrappedAlert>
      ))}

      {showAll === false && (alerts?.length || 0) > MINIMUM_ALERTS_TO_SHOW && (
        <MonitoringSidebarBlueButton onClick={onShowAllAlerts}>
          {t['Show more']}{' '}
          {alerts && `(${alerts.length - MINIMUM_ALERTS_TO_SHOW})`}
        </MonitoringSidebarBlueButton>
      )}
    </>
  );
};

const WrappedAlert = styled.div`
  margin-top: 1em;
`;

export default ListMonitoringJobAlerts;
