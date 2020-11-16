import React, { useEffect } from 'react';
import {
  useParams,
  useHistory,
  useRouteMatch,
  useLocation,
} from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { DetailsItem, ErrorFeedback, Loader, Tabs } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { formatMetadata } from 'lib/utils';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { createLink } from '@cognite/cdf-utilities';

export type TimeseriesPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const TimeseriesPage = () => {
  const history = useHistory();
  const { id: timeseriesIdString } = useParams<{
    id: string;
  }>();
  const timeseriesId = parseInt(timeseriesIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.Timeseries', { timeseriesId });
  }, [timeseriesId]);

  const { data: timeseries, isFetched, error } = useCdfItem<Timeseries>(
    'timeseries',
    { id: timeseriesId }
  );

  const match = useRouteMatch();
  const location = useLocation();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as TimeseriesPreviewTabType;

  if (!timeseriesIdString) {
    return null;
  }

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
      <ResourceTitleRow id={timeseriesId} type="timeSeries" icon="Timeseries" />
      {timeseries && (
        <Row>
          <Col span={24}>
            <TimeseriesChart
              timeseriesId={timeseries.id}
              height={500}
              defaultOption="2Y"
            />
            <ResourceDetailsTabs
              parentResource={{
                type: 'timeSeries',
                id: timeseries.id,
                externalId: timeseries.externalId,
              }}
              tab={activeTab}
              onTabChange={newTab =>
                history.push(
                  createLink(
                    `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
                  )
                )
              }
              additionalTabs={[
                <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
                  {' '}
                  {formatMetadata(
                    (timeseries && timeseries.metadata) ?? {}
                  ).map(el => (
                    <DetailsItem key={el.key} name={el.key} value={el.value} />
                  ))}
                </Tabs.Pane>,
              ]}
            />
          </Col>
        </Row>
      )}
    </>
  );
};
