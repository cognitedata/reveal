import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { Tabs } from '@cognite/cogs.js';
import {
  ErrorFeedback,
  Loader,
  TimeseriesChart,
  Metadata,
  TimeseriesDetails,
} from '@cognite/data-exploration';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';

import { useDateRange } from 'app/context/DateRangeContext';
import { useOnPreviewTabChange } from 'app/hooks';
import styled from 'styled-components';

export type TimeseriesPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const TimeseriesPreview = ({
  timeseriesId,
  actions,
}: {
  timeseriesId: number;
  actions?: React.ReactNode;
}) => {
  const { tabType } = useParams<{
    tabType: TimeseriesPreviewTabType;
  }>();
  const activeTab = tabType || 'details';

  const tabChange = useOnPreviewTabChange(tabType, 'timeseries');
  const [dateRange, setDateRange] = useDateRange();

  useEffect(() => {
    trackUsage('Exploration.Preview.Timeseries', { timeseriesId });
  }, [timeseriesId]);

  const {
    data: timeseries,
    isFetched,
    error,
  } = useCdfItem<Timeseries>('timeseries', { id: timeseriesId });

  if (!timeseriesId || !Number.isFinite(timeseriesId)) {
    return <>Invalid time series id {timeseriesId}</>;
  }
  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Timeseries {timeseriesId} not found!</>;
  }

  return (
    <>
      <ResourceTitleRow
        datefilter={{
          start: dateRange[0],
          end: dateRange[1],
        }}
        item={{ id: timeseriesId, type: 'timeSeries' }}
        afterDefaultActions={actions}
      />

      {timeseries && (
        <TimeseriesWrapper>
          <TimeseriesChartWrapper>
            <TimeseriesChart
              timeseriesId={timeseries.id}
              showCustomRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </TimeseriesChartWrapper>
          <ResourceDetailsTabs
            parentResource={{
              type: 'timeSeries',
              id: timeseries.id,
              externalId: timeseries.externalId,
            }}
            tab={activeTab}
            onTabChange={tabChange}
            additionalTabs={[
              <Tabs.TabPane tab={<TabTitle>Details</TabTitle>} key="details">
                <TimeseriesDetails timeseries={timeseries} />
                <Metadata metadata={timeseries.metadata} />
              </Tabs.TabPane>,
            ]}
          />
        </TimeseriesWrapper>
      )}
    </>
  );
};

const TimeseriesChartWrapper = styled.div`
  height: 300px;
  width: calc(100% - 16px);
  display: flex;
  flex-direction: column;
`;

const TimeseriesWrapper = styled.div`
  overflow: auto;

  .rc-tabs {
    overflow: unset;
  }
`;
