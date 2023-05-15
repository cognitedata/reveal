import { Loader } from '@data-exploration/components';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteError, Timeseries } from '@cognite/sdk';
import { Tabs } from '@cognite/cogs.js';
import {
  ErrorFeedback,
  Metadata,
  TimeseriesDetails,
} from '@cognite/data-exploration';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';

import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import styled from 'styled-components';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';
import { usePreviewDateRange } from '@data-exploration-app/hooks';

import { TimeseriesChart } from '@cognite/plotting-components';

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

  const [dateRange, setDateRange] = usePreviewDateRange();

  const [, openPreview] = useCurrentResourceId();

  const handlePreviewClose = () => {
    openPreview(undefined);
  };

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
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!timeseries) {
    return <>Timeseries {timeseriesId} not found!</>;
  }

  return (
    <>
      <Breadcrumbs
        currentResource={{
          title:
            timeseries.name || timeseries.externalId || String(timeseries.id),
        }}
      />
      <ResourceTitleRow
        datefilter={{
          start: dateRange[0],
          end: dateRange[1],
        }}
        item={{ id: timeseriesId, type: 'timeSeries' }}
        title={timeseries.name}
        afterDefaultActions={actions}
      />

      {timeseries && (
        <TimeseriesWrapper>
          <ResourceDetailsTabs
            parentResource={{
              type: 'timeSeries',
              id: timeseries.id,
              externalId: timeseries.externalId,
              title:
                timeseries.name ||
                timeseries.externalId ||
                String(timeseries.id),
            }}
            onTabChange={tabChange}
            tab={activeTab}
            additionalTabs={[
              <Tabs.Tab label="Details" key="details" tabKey="details">
                <DetailsTabWrapper>
                  <TimeseriesChart
                    timeseriesId={timeseries.id}
                    height={300}
                    quickTimePeriodOptions={['1D', '1W', '1Y']}
                    dateRange={dateRange}
                    onChangeDateRange={setDateRange}
                  />
                  <TimeseriesDetails timeseries={timeseries} />
                  <Metadata metadata={timeseries.metadata} />
                </DetailsTabWrapper>
              </Tabs.Tab>,
            ]}
          />
        </TimeseriesWrapper>
      )}
    </>
  );
};

const TimeseriesWrapper = styled.div`
  overflow: auto;
  height: 100%;
`;
