import React, { memo, useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
} from 'components/Common/SidebarElements';
import { Collapse } from '@cognite/cogs.js';
import { head } from 'lodash';
import { useSearchParam } from 'hooks/navigation';
import {
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  MONITORING_SIDEBAR_SELECTED_FOLDER,
} from 'utils/constants';
import { useUserInfo } from 'hooks/useUserInfo';
import { useChartAtom } from 'models/chart/atom';
import { trackUsage } from 'services/metrics';
import { SidebarChip, SidebarCollapseWrapped } from './elements';
import { MonitoringFolderJobs, MonitoringJob } from './types';
import { useMonitoringFoldersWithJobs } from './hooks';
import ListMonitoringJobPreview from './ListMonitoringJobPreview';
import { getTsIds } from '../../domain/timeseries/internal/transformers/getTsIds';
import EmptyState from './EmptyState';
import {
  JobAndAlertsFilter,
  FilterOption,
  MONITORING_FILTER_OPTIONS,
} from './JobAndAlertsFilter';

const ListMonitoringJobs = memo(() => {
  const userInfo = useUserInfo();
  const [chart] = useChartAtom();

  const userAuthId = userInfo.data?.id;
  const [monitoringFolderParam, setMonitoringFolderParam] = useSearchParam(
    MONITORING_SIDEBAR_SELECTED_FOLDER
  );
  const [monitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );
  const [activeKeys, setActiveKeys] = useState(
    monitoringFolderParam ? [monitoringFolderParam] : []
  );
  const [filterOption, setFilterOption] = useState<FilterOption>(
    MONITORING_FILTER_OPTIONS[0]
  );

  const handleToggleAccordian = (key: any) => {
    trackUsage('Sidebar.Monitoring.ToggleJob', {
      monitoringJob: key,
    });
    setActiveKeys(key);
  };

  const handleFilterOptionChange = (updatedFilterOption: FilterOption) => {
    trackUsage('Sidebar.Monitoring.FilterOptionChanged', {
      filter: updatedFilterOption.value,
    });
    setFilterOption(updatedFilterOption);
  };

  useEffect(() => {
    setMonitoringFolderParam(head(activeKeys));
  }, [activeKeys]);

  const { data: folders, isFetching } = useMonitoringFoldersWithJobs(
    'monitoring-sidebar',
    userAuthId,
    {
      subscribed: filterOption.value === 'subscribed',
      timeseriesIds:
        filterOption.value === 'current' ? getTsIds(chart) : undefined,
    }
  );

  useEffect(() => {
    const foundFolder = folders?.find((folder: MonitoringFolderJobs) => {
      return (
        monitoringJobIdParam &&
        folder.tasks.find((task: MonitoringJob) => {
          return task.id === Number(monitoringJobIdParam);
        })
      );
    });
    if (foundFolder) {
      setActiveKeys([foundFolder?.folderExtID]);
    }
  }, [folders, monitoringJobIdParam]);

  if (isFetching && activeKeys.length === 0) {
    return <LoadingRow lines={9} showCircle={false} />;
  }

  return (
    <>
      <JobAndAlertsFilter
        mode="monitoring"
        onChange={handleFilterOptionChange}
        value={filterOption}
      />
      {folders?.length ? (
        <SidebarCollapseWrapped
          activeKey={activeKeys}
          onChange={handleToggleAccordian}
          expandIcon={({ isActive }) => (
            <ExpandIcon $active={Boolean(isActive)} type="ChevronDownLarge" />
          )}
        >
          {folders
            ?.sort(
              (
                folderA: MonitoringFolderJobs,
                folderB: MonitoringFolderJobs
              ) => {
                if (monitoringJobIdParam !== undefined) {
                  if (head(activeKeys) === folderA.folderExtID) {
                    return -1;
                  }
                  return 1;
                }
                return folderA.folderExtID < folderB.folderExtID ? -1 : 1;
              }
            )
            .map((folder: MonitoringFolderJobs) => {
              return (
                <Collapse.Panel
                  key={folder.folderExtID}
                  header={
                    <CollapsePanelTitle>
                      <Row align="middle" wrap={false}>
                        <Col>
                          {folder.folderExtID.replace('charts-folder-', '')}
                        </Col>
                        <Col>
                          <SidebarChip icon="Alarm" size="medium">
                            {folder.count}
                          </SidebarChip>
                        </Col>
                      </Row>
                    </CollapsePanelTitle>
                  }
                >
                  {folder.tasks
                    .sort((job) =>
                      job.id === Number(monitoringJobIdParam || '') ? -1 : 0
                    )
                    .map((job: MonitoringJob) => {
                      return (
                        <ListMonitoringJobPreview
                          key={job.externalId}
                          monitoringJob={job}
                        />
                      );
                    })}
                </Collapse.Panel>
              );
            })}
        </SidebarCollapseWrapped>
      ) : (
        <EmptyState />
      )}
    </>
  );
});

export default ListMonitoringJobs;
