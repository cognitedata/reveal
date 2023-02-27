import { Button, Collapse, Icon, toast, Tooltip } from '@cognite/cogs.js';
import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from 'components/Common/SidebarElements';
import EmptyState from 'components/AlertingSidebar/EmptyState';
import React, { useEffect, useState } from 'react';
import { makeDefaultTranslations } from 'utils/translations';
import { MonitoringJob } from 'components/MonitoringSidebar/types';
import { Col, Row } from 'antd';
import { useMonitoringFoldersWithJobs } from 'components/MonitoringSidebar/hooks';
import styled from 'styled-components';
import { JobsWithAlertsContainer, SidebarCollapseAlert } from './elements';
import MonitoringJobWithAlerts from './MonitoringJobWithAlerts';

const defaultTranslations = makeDefaultTranslations(
  'Alerts',
  'Hide',
  'Unable to load alerts'
);

type Props = {
  onViewMonitoringJobs: () => void;
  translations?: typeof defaultTranslations;
  onClose: () => void;
};
const AlertingSidebar = ({
  onViewMonitoringJobs,
  translations,
  onClose,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const {
    isError,
    isFetching,
    data: taskData,
  } = useMonitoringFoldersWithJobs();

  const allJobs = taskData
    ?.map((item) => item.tasks)
    .reduce((items, acc) => [...acc, ...items], []);

  useEffect(() => {
    if (isError) {
      toast.error(t['Unable to load alerts']);
    }
  }, [isError]);

  return (
    <SidebarWithScroll visible>
      <TopContainer>
        <TopContainerTitle>
          <Icon size={21} type="Bell" />
          {t.Alerts}
        </TopContainerTitle>
        <TopContainerAside>
          <Tooltip content={t.Hide}>
            <Button
              icon="Close"
              type="ghost"
              onClick={onClose}
              aria-label="Close"
            />
          </Tooltip>
        </TopContainerAside>
      </TopContainer>
      <JobsWithAlertsContainer>
        <DisplayAlerts
          jobs={allJobs}
          isFetching={isFetching}
          isError={isError}
          onViewMonitoringJobs={onViewMonitoringJobs}
        />
      </JobsWithAlertsContainer>
    </SidebarWithScroll>
  );
};

type DisplayAlertsProps = {
  isFetching: boolean;
  isError: boolean;
  jobs: MonitoringJob[] | undefined;
  onViewMonitoringJobs: () => void;
};
const DisplayAlerts = ({
  isFetching,
  isError,
  jobs,
  onViewMonitoringJobs,
}: DisplayAlertsProps) => {
  const [activeKeys, setActiveKeys] = useState([]);

  const handleToggleAccordian = (key: any) => {
    setActiveKeys(key);
  };
  if (isFetching) {
    return <LoadingRow lines={30} />;
  }
  if (isError === true || jobs?.length === 0) {
    return <EmptyState onViewMonitoringJobs={onViewMonitoringJobs} />;
  }
  return (
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
  );
};

export default AlertingSidebar;

const SidebarWithScroll = styled(Sidebar)`
  overflow-y: auto;
`;
