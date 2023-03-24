import { Collapse, Flex, Body } from '@cognite/cogs.js';
import { useState } from 'react';
import { MonitoringJob } from 'components/MonitoringSidebar/types';
import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
} from 'components/Common/SidebarElements';
import EmptyState from 'components/AlertingSidebar/EmptyState';
import { trackUsage } from 'services/metrics';
import JobCondition from 'components/MonitoringSidebar/JobCondition';
import { SidebarCollapseAlert, ConditionContainer } from './elements';
import MonitoringJobWithAlerts from './MonitoringJobWithAlerts';
import { AlertsList } from './AlertsList';

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
  if (isError === true || jobs?.length === 0) {
    return <EmptyState onViewMonitoringJobs={onViewMonitoringJobs} />;
  }
  return (
    <>
      <SidebarCollapseAlert
        activeKey={activeKeys}
        onChange={handleToggleAccordian}
        expandIcon={({ isActive }) => (
          <ExpandIcon
            $active={Boolean(isActive)}
            type="ChevronDownSmall"
            style={{ top: '14px' }}
          />
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
