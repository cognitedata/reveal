import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { Loader, Metadata } from '@data-exploration/components';
import { TimeseriesInfo } from '@data-exploration/containers';
import { useCdfUserHistoryService } from '@user-history';
import isUndefined from 'lodash/isUndefined';

import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { TimeseriesChart } from '@cognite/plotting-components';
import { CogniteError, Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { useTranslation, SUB_APP_PATH } from '@data-exploration-lib/core';

import { BreadcrumbsV2 } from '../../components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRow from '../../components/ResourceTitleRow';
import {
  useEndJourney,
  usePreviewDateRange,
  useResourceDetailSelectedTab,
} from '../../hooks';
import { trackUsage } from '../../utils/Metrics';
import { AllTab } from '../All';
import { DetailsTabWrapper } from '../Common/element';
import { ResourceDetailsTabs } from '../ResourceDetails';

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
  const { t } = useTranslation();

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
          path: pathname.concat(searchParams),
        });
    }
  }, [isTimeseriesFetched, timeseries]);

  const allResourcesFilter = useMemo(() => {
    if (!timeseries || isUndefined(timeseries.assetId)) {
      return {};
    }
    return {
      assetSubtreeIds: [{ value: timeseries.assetId }],
    };
  }, [timeseries]);

  if (!timeseriesId || !Number.isFinite(timeseriesId)) {
    return (
      <>
        {t('INVALID_TIMESERIES_ID', 'Invalid time series id')} {timeseriesId}
      </>
    );
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
    return (
      <>
        {t('RESOURCE_NOT_FOUND', `Timeseries ${timeseriesId} not found!`, {
          resourceType: t('TIMESERIES', 'Timeseries'),
          id: timeseriesId,
        })}
      </>
    );
  }

  return (
    <>
      <BreadcrumbsV2 />
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
            onTabChange={handleTabChange}
            tab={activeTab}
            additionalTabs={[
              <Tabs.Tab
                label={t('DETAILS', 'Details')}
                key="details"
                tabKey="details"
              >
                <DetailsTabWrapper data-testid="timeseries-details">
                  <TimeseriesChart
                    timeseries={{ id: timeseries.id }}
                    height={300}
                    quickTimePeriodOptions={['1D', '1W', '1Y']}
                    dateRange={dateRange}
                    onChangeDateRange={setDateRange}
                  />
                  <TimeseriesInfo timeseries={timeseries} />
                  <Metadata metadata={timeseries.metadata} />
                </DetailsTabWrapper>
              </Tabs.Tab>,
              <Tabs.Tab
                label={t('ALL_RESOURCES', 'All resources')}
                key="all-resources"
                tabKey="all-resources"
              >
                <AllTab
                  filters={{ common: allResourcesFilter }}
                  setCurrentResourceType={(type) =>
                    type && setSelectedTab(type)
                  }
                  selectedResourceExternalId={timeseries.externalId}
                />
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
