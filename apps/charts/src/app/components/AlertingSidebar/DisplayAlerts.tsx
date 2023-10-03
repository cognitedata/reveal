import { useState } from 'react';

import { Collapse, Flex, Body } from '@cognite/cogs.js';

import { trackUsage } from '../../services/metrics';
import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
} from '../Common/SidebarElements';
import JobCondition from '../MonitoringSidebar/JobCondition';
import { MonitoringJob } from '../MonitoringSidebar/types';

import { AlertsList } from './AlertsList';
import { SidebarCollapseAlert, ConditionContainer } from './elements';
import EmptyState from './EmptyState';
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
