import { useState } from 'react';

import { Collapse, Flex, Body } from '@cognite/cogs.js';

import { useChartAtom } from '../../models/chart/atom';
import {
  addChartThreshold,
  removeChartThreshold,
} from '../../models/chart/updates-threshold';
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
  const [activeKey, setActiveKey] = useState(undefined);
  const [chart, setChart] = useChartAtom();
  const handleToggleAccordion = (key: any) => {
    if (key.length) {
      setActiveKey(key[key.length - 1]);

      const targetJob = jobs!.find(
        (job) => job.externalId === key[key.length - 1]
      );

      if (targetJob) {
        const targetTimeseries = chart?.timeSeriesCollection?.find(
          (timeSeries) => timeSeries.tsId === targetJob.model.timeseriesId
        );

        if (targetTimeseries) {
          setChart((oldChart) =>
            addChartThreshold(oldChart!, {
              id: targetJob.externalId,
              name: targetJob.externalId,
              visible: true,
              sourceId: targetTimeseries.id,
              upperLimit: targetJob.model.upperThreshold,
              type: 'under',
              filter: {},
              addedBy: 'alertSidebar',
              color: '#BF0A36',
            })
          );
        }
      }
    } else {
      if (activeKey) {
        setChart((oldChart) => {
          return removeChartThreshold(oldChart!, activeKey);
        });
      }
      setActiveKey(undefined);
    }
    trackUsage('Sidebar.Alerting.ToggleAlert', { alert: key });
  };

  if (activeKey === undefined && isFetching) {
    return <LoadingRow lines={30} />;
  }
  if (isError === true || jobs?.length === 0 || !jobs) {
    return <EmptyState onViewMonitoringJobs={onViewMonitoringJobs} />;
  }
  return (
    <>
      <SidebarCollapseAlert
        activeKey={activeKey}
        onChange={handleToggleAccordion}
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
