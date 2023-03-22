import { Button, Icon, toast, Tooltip } from '@cognite/cogs.js';
import {
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from 'components/Common/SidebarElements';
import { useEffect, useState } from 'react';
import { makeDefaultTranslations } from 'utils/translations';
import { useMonitoringFoldersWithJobs } from 'components/MonitoringSidebar/hooks';
import { saveToLocalStorage } from '@cognite/storage';
import { jobsToAlerts } from 'pages/ChartViewPage/NotificationIndicator';
import { MONITORING_SIDEBAR_ALERT_COUNT_KEY } from 'utils/constants';
import { useQueryClient } from 'react-query';
import {
  JobAndAlertsFilter,
  FilterOption,
  ALERTING_FILTER_OPTIONS,
} from 'components/MonitoringSidebar/JobAndAlertsFilter';
import { useChartAtom } from 'models/chart/atom';
import { trackUsage } from 'services/metrics';
import { JobsWithAlertsContainer, SidebarWithScroll } from './elements';
import { getTsIds } from '../../domain/timeseries/internal/transformers/getTsIds';
import { DisplayAlerts } from './DisplayAlerts';

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

export const AlertingSidebar = ({
  onViewMonitoringJobs,
  translations,
  onClose,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const [chart] = useChartAtom();

  const [filterOption, setFilterOption] = useState<FilterOption>(
    ALERTING_FILTER_OPTIONS[0]
  );

  const handleFilterOptionChange = (updatedFilterOption: FilterOption) => {
    setFilterOption(updatedFilterOption);
    trackUsage('Sidebar.Alerting.FilterOptionChanged', {
      filter: updatedFilterOption.value,
    });
  };

  const {
    isError,
    isFetching,
    data: taskData,
  } = useMonitoringFoldersWithJobs('alerting-sidebar', {
    subscribed: filterOption.value === 'subscribed',
    timeseriesIds:
      filterOption.value === 'current' ? getTsIds(chart) : undefined,
    currentChart: filterOption.value === 'current',
  });

  const cache = useQueryClient();

  const allJobs = taskData
    ?.map((item) => item.tasks)
    .reduce((items, acc) => [...acc, ...items], [])
    .filter((job) => job.alertCount > 0);

  useEffect(() => {
    cache.invalidateQueries(['monitoring-folders-jobs-alerting-sidebar']);
  }, []);

  useEffect(() => {
    saveToLocalStorage(
      MONITORING_SIDEBAR_ALERT_COUNT_KEY,
      jobsToAlerts(taskData)
    );
  }, [taskData]);

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
        <JobAndAlertsFilter
          mode="alerting"
          onChange={handleFilterOptionChange}
          value={filterOption}
        />
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
