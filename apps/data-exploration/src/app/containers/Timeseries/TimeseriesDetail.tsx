import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { Loader, Metadata } from '@data-exploration/components';
import { TimeseriesInfo } from '@data-exploration/containers';

import { useCdfUserHistoryService } from '@cognite/cdf-utilities';
import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { TimeseriesChart } from '@cognite/plotting-components';
import { CogniteError, Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { BreadcrumbsV2 } from '@data-exploration-app/components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRowV2 from '@data-exploration-app/components/ResourceTitleRowV2';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabsV2 } from '@data-exploration-app/containers/ResourceDetails';
import {
  useEndJourney,
  usePreviewDateRange,
  useResourceDetailSelectedTab,
} from '@data-exploration-app/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { SUB_APP_PATH, createInternalLink } from '@data-exploration-lib/core';

// TimeseriesPreviewTabType;
// - details
// - assets
// - timeseries
// - files
// - sequences
// - events

export const TimeseriesDetail = ({
  timeseriesId,
  actions,
}: {
  timeseriesId: number;
  actions?: React.ReactNode;
}) => {
  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [endJourney] = useEndJourney();

  const activeTab = selectedTab || 'details';

  const [dateRange, setDateRange] = usePreviewDateRange();

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  const handlePreviewClose = () => {
    endJourney();
  };

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
  };

  useEffect(() => {
    trackUsage('Exploration.Preview.Timeseries', { timeseriesId });
  }, [timeseriesId]);

  const {
    data: timeseries,
    isFetched: isTimeseriesFetched,
    error,
  } = useCdfItem<Timeseries>('timeseries', { id: timeseriesId });

  useEffect(() => {
    if (isTimeseriesFetched && timeseries) {
      // save Timeseries preview as view resource in user history
      if (timeseries?.name)
        userHistoryService.logNewResourceView({
          application: SUB_APP_PATH,
          name: timeseries?.name,
          path: createInternalLink(pathname, searchParams),
        });
    }
  }, [isTimeseriesFetched, timeseries]);

  if (!timeseriesId || !Number.isFinite(timeseriesId)) {
    return <>Invalid time series id {timeseriesId}</>;
  }
  if (!isTimeseriesFetched) {
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
      <BreadcrumbsV2 />
      <ResourceTitleRowV2
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
          <ResourceDetailsTabsV2
            parentResource={{
              type: 'timeSeries',
              id: timeseries.id,
              externalId: timeseries.externalId,
              title:
                timeseries.name ||
                timeseries.externalId ||
                String(timeseries.id),
            }}
            onTabChange={handleTabChange}
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
                  <TimeseriesInfo timeseries={timeseries} />
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
