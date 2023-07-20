import { useState } from 'react';

import EmptyState from '@charts-app/components/AlertingSidebar/EmptyState';
import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
} from '@charts-app/components/Common/SidebarElements';
import JobCondition from '@charts-app/components/MonitoringSidebar/JobCondition';
import { MonitoringJob } from '@charts-app/components/MonitoringSidebar/types';
import { trackUsage } from '@charts-app/services/metrics';

import { Collapse, Flex, Body } from '@cognite/cogs.js';

import { AlertsList } from './AlertsList';
import { SidebarCollapseAlert, ConditionContainer } from './elements';
import MonitoringJobWithAlerts from './MonitoringJobWithAlerts';

type DisplayAlertsProps = {
  isFetching: boolean;
  isError: boolean;
  jobs: MonitoringJob[] | undefined;
  onViewMonitoringJobs: () => void;
};

export const DisplayAlerts = ({
  isFetching,
  isError,
  jobs,
  onViewMonitoringJobs,
}: DisplayAlertsProps) => {
  const [activeKeys, setActiveKeys] = useState([]);

  const handleToggleAccordian = (key: any) => {
    setActiveKeys(key);
    trackUsage('Sidebar.Alerting.ToggleAlert', { alert: key });
  };

  if (activeKeys.length === 0 && isFetching) {
    return <LoadingRow lines={30} />;
  }
  if (isError === true || jobs?.length === 0 || !jobs) {
    return <EmptyState onViewMonitoringJobs={onViewMonitoringJobs} />;
  }
  return (
    <>
      <SidebarCollapseAlert
        activeKey={activeKeys}
        onChange={handleToggleAccordian}
        expandIcon={({ isActive }) => (
          <ExpandIcon $active={Boolean(isActive)} type="ChevronDownSmall" />
        )}
      >
        {jobs?.map((job: MonitoringJob) => (
          <Collapse.Panel
            key={job.externalId}
            header={
              <Flex direction="column">
                <CollapsePanelTitle>
                  <Body level={2} strong style={{ height: '16px' }}>
                    {job.externalId}
                  </Body>
                </CollapsePanelTitle>
                <ConditionContainer level={3}>
                  <JobCondition job={job} />
                </ConditionContainer>
                <MonitoringJobWithAlerts job={job} key={job.id} />
              </Flex>
            }
          >
            <AlertsList
              job={job}
              key={job.id}
              onViewMonitoringJobs={onViewMonitoringJobs}
            />
          </Collapse.Panel>
        ))}
      </SidebarCollapseAlert>
    </>
  );
};
