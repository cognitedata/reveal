import React, { memo, useEffect, useState } from 'react';

import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
} from '@charts-app/components/Common/SidebarElements';
import { CHARTS_FOLDER_PREFIX } from '@charts-app/domain/monitoring/constants';
import { useSearchParam } from '@charts-app/hooks/navigation';
import { useChartAtom } from '@charts-app/models/chart/atom';
import { trackUsage } from '@charts-app/services/metrics';
import {
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  MONITORING_SIDEBAR_SELECTED_FOLDER,
  MONITORING_FILTER,
} from '@charts-app/utils/constants';
import { Col, Row } from 'antd';
import difference from 'lodash/difference';
import head from 'lodash/head';

import { Collapse } from '@cognite/cogs.js';

import { getTsIds } from '../../domain/chart/internal/transformers/getTsIds';

import { SidebarChip, SidebarCollapseWrapped, ExpandTitle } from './elements';
import EmptyState from './EmptyState';
import { useMonitoringFoldersWithJobs } from './hooks';
import {
  JobAndAlertsFilter,
  FilterOption,
  MONITORING_FILTER_OPTIONS,
} from './JobAndAlertsFilter';
import ListMonitoringJobPreview from './ListMonitoringJobPreview';
import { MonitoringFolderJobs, MonitoringJob } from './types';

const removePrefixFromFolder = (folderName = '') =>
  folderName.replace(CHARTS_FOLDER_PREFIX, '');

const ListMonitoringJobs = memo(() => {
  const [chart] = useChartAtom();

  const [monitoringFolderParam, setMonitoringFolderParam] = useSearchParam(
    MONITORING_SIDEBAR_SELECTED_FOLDER
  );
  const [monitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );
  const [
    filterOption = MONITORING_FILTER_OPTIONS[0].value,
    setMonitoringFilter,
  ] = useSearchParam(MONITORING_FILTER);
  const [activeKeys, setActiveKeys] = useState<string[]>(
    monitoringFolderParam ? [monitoringFolderParam] : []
  );

  const handleToggleAccordian = (folderNames: any) => {
    // need only toggled folder name
    const toggledFolder =
      folderNames?.length > activeKeys?.length
        ? difference(folderNames, activeKeys)
        : difference(activeKeys, folderNames);

    // remove prefix
    const folder = toggledFolder.map(removePrefixFromFolder);

    trackUsage('Sidebar.Monitoring.ToggleFolder', {
      folder,
      filter: filterOption,
    });

    setActiveKeys(folderNames);
  };

  const handleFilterOptionChange = (updatedFilterOption: FilterOption) => {
    trackUsage('Sidebar.Monitoring.FilterOptionChanged', {
      filter: updatedFilterOption.value,
    });
    setMonitoringFilter(updatedFilterOption.value);
  };

  useEffect(() => {
    setMonitoringFolderParam(head(activeKeys));
  }, [activeKeys]);

  const { data: folders, isFetching } = useMonitoringFoldersWithJobs(
    'monitoring-sidebar',
    {
      subscribed: filterOption === 'subscribed',
      timeseriesIds: filterOption === 'current' ? getTsIds(chart) : undefined,
      currentChart: filterOption === 'current',
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
        value={
          MONITORING_FILTER_OPTIONS.find(
            (option) => option.value === filterOption
          )!
        }
      />
      {folders?.length ? (
        <SidebarCollapseWrapped
          activeKey={activeKeys}
          onChange={handleToggleAccordian}
          expandIcon={({ isActive }) => (
            <ExpandIcon $active={Boolean(isActive)} type="ChevronDownSmall" />
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
                          <ExpandTitle level={2} strong>
                            {removePrefixFromFolder(folder.folderExtID)}
                          </ExpandTitle>
                        </Col>
                        <Col>
                          <SidebarChip
                            icon="Alarm"
                            size="medium"
                            label={`${folder.count}`}
                          />
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
                          trackingInfo={{
                            folderName: removePrefixFromFolder(
                              folder.folderExtID
                            ),
                            filter: filterOption,
                          }}
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
