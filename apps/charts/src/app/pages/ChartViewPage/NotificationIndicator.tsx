import React, { useEffect, useState } from 'react';

import { NotificationDot } from '@cognite/cogs.js';
import { getFromLocalStorage } from '@cognite/storage';

import { useMonitoringFoldersWithJobs } from '../../components/MonitoringSidebar/hooks';
import { MonitoringJob } from '../../components/MonitoringSidebar/types';
import { MONITORING_SIDEBAR_ALERT_COUNT_KEY } from '../../utils/constants';

export const jobsToAlerts = (taskData: any): number => {
  return (
    taskData
      ?.map((item: any) => item.tasks)
      .reduce((items: any, acc: any) => [...acc, ...items], [])
      .filter((items: any) => items.subscribed)
      .map((job: MonitoringJob) => job.alertCount)
      .reduce((totalCount: number, count: number) => {
        return totalCount + count;
      }, 0) || 0
  );
};
const NotificationIndicator = () => {
  const { data: taskData } = useMonitoringFoldersWithJobs('indicator');
  const [showIndicator, setShowIndicator] = useState(false);

  const alertCountFromAPI = jobsToAlerts(taskData);
  let interval: any = null;
  useEffect(() => {
    if (!interval) {
      interval = setInterval(() => {
        const lastCount =
          getFromLocalStorage(MONITORING_SIDEBAR_ALERT_COUNT_KEY, 0) || 0;
        if (alertCountFromAPI > lastCount) {
          setShowIndicator(true);
        } else {
          setShowIndicator(false);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [alertCountFromAPI]);

  return (
    <div style={{ position: 'relative', top: -35, right: -35 }}>
      {showIndicator && <NotificationDot />}
    </div>
  );
};

export default NotificationIndicator;
