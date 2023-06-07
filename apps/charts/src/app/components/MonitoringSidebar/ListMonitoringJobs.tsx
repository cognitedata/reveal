import React, { memo, useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import {
  CollapsePanelTitle,
  ExpandIcon,
  LoadingRow,
} from 'components/Common/SidebarElements';
import { Collapse } from '@cognite/cogs.js';
import head from 'lodash/head';
import difference from 'lodash/difference';
import { useSearchParam } from 'hooks/navigation';
import {
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  MONITORING_SIDEBAR_SELECTED_FOLDER,
  MONITORING_FILTER,
} from 'utils/constants';
import { useChartAtom } from 'models/chart/atom';
import { trackUsage } from 'services/metrics';
import { CHARTS_FOLDER_PREFIX } from 'domain/monitoring/constants';
import { SidebarChip, SidebarCollapseWrapped, ExpandTitle } from './elements';
import { MonitoringFolderJobs, MonitoringJob } from './types';
import { useMonitoringFoldersWithJobs } from './hooks';
import ListMonitoringJobPreview from './ListMonitoringJobPreview';
import { getTsIds } from '../../domain/chart/internal/transformers/getTsIds';
import EmptyState from './EmptyState';
import {
  JobAndAlertsFilter,
  FilterOption,
  MONITORING_FILTER_OPTIONS,
} from './JobAndAlertsFilter';

const removePrefixFromFolder = (folderName: string = '') =>
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
                          <SidebarChip icon="Alarm" size="medium">
                            <div>{folder.count}</div>
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
