import { Collapse } from '@cognite/cogs.js';
import { useState } from 'react';
import { MonitoringJob } from 'components/MonitoringSidebar/types';
import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
} from 'components/Common/SidebarElements';
import EmptyState from 'components/AlertingSidebar/EmptyState';
import { Col, Row } from 'antd';
import { trackUsage } from 'services/metrics';
import { SidebarCollapseAlert } from './elements';
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
  if (isError === true || jobs?.length === 0) {
    return <EmptyState onViewMonitoringJobs={onViewMonitoringJobs} />;
  }
  return (
    <>
      <SidebarCollapseAlert
        activeKey={activeKeys}
        onChange={handleToggleAccordian}
        expandIcon={({ isActive }) => (
          <ExpandIcon $active={Boolean(isActive)} type="ChevronDownLarge" />
        )}
      >
        {jobs?.map((job: MonitoringJob) => (
          <Collapse.Panel
            key={job.externalId}
            header={
              <CollapsePanelTitle>
                <Row align="middle" wrap={false}>
                  <Col>{job.externalId}</Col>
                </Row>
              </CollapsePanelTitle>
            }
          >
            <MonitoringJobWithAlerts
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
