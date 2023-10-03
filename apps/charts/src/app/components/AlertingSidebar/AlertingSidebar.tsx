import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { Button, Icon, toast, Tooltip } from '@cognite/cogs.js';
import { saveToLocalStorage } from '@cognite/storage';

import {
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from '../../components/Common/SidebarElements';
import { useMonitoringFoldersWithJobs } from '../../components/MonitoringSidebar/hooks';
import {
  JobAndAlertsFilter,
  FilterOption,
  ALERTING_FILTER_OPTIONS,
} from '../../components/MonitoringSidebar/JobAndAlertsFilter';
import {
  useGetTsExternalIdsFromScheduledCalculations,
  useGetTsIdsFromTimeseriesCollection,
} from '../../domain/chart/internal/queries/useGetTSIds';
import { useSearchParam } from '../../hooks/navigation';
import { useTranslations } from '../../hooks/translations';
import { jobsToAlerts } from '../../pages/ChartViewPage/NotificationIndicator';
import { trackUsage } from '../../services/metrics';
import {
  MONITORING_SIDEBAR_ALERT_COUNT_KEY,
  ALERTING_FILTER,
} from '../../utils/constants';
import { makeDefaultTranslations } from '../../utils/translations';
import { TempPromoChip } from '../TempPromoChip/TempPromoChip';

import { DisplayAlerts } from './DisplayAlerts';
import { JobsWithAlertsContainer, SidebarWithScroll } from './elements';

const defaultTranslation = makeDefaultTranslations(
  'Alerts',
  'Hide',
  'Unable to load alerts',
  'Show',
  'Beta',
  'This feature is available for beta testing and will likely change. Use it for testing purposes only.'
);

type Props = {
  onViewMonitoringJobs: () => void;
  onClose: () => void;
};

export const AlertingSidebar = ({ onViewMonitoringJobs, onClose }: Props) => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'AlertingSidebar').t,
  };

  const timeseriesCollectionTsIds = useGetTsIdsFromTimeseriesCollection();
  const scheduledCalculationTsExternalIds =
    useGetTsExternalIdsFromScheduledCalculations();
  const [filterOption = ALERTING_FILTER_OPTIONS[0].value, setFilterOption] =
    useSearchParam(ALERTING_FILTER);

  const handleFilterOptionChange = (updatedFilterOption: FilterOption) => {
    setFilterOption(updatedFilterOption.value);
    trackUsage('Sidebar.Alerting.FilterOptionChanged', {
      filter: updatedFilterOption.value,
    });
  };

  const {
    isError,
    isFetching,
    data: taskData,
  } = useMonitoringFoldersWithJobs('alerting-sidebar', {
    subscribed: filterOption === 'subscribed',
    timeseriesIds:
      filterOption === 'current' ? timeseriesCollectionTsIds : undefined,
    timeseriesExternalIds:
      filterOption === 'current'
        ? scheduledCalculationTsExternalIds
        : undefined,
    currentChart: filterOption === 'current',
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
          <TempPromoChip
            tooltip={
              t[
                'This feature is available for beta testing and will likely change. Use it for testing purposes only.'
              ]
            }
          >
            {t['Beta']}
          </TempPromoChip>
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
          value={
            ALERTING_FILTER_OPTIONS.find(
              (option) => option.value === filterOption
            )!
          }
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
