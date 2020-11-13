import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { DetailsItem, ErrorFeedback, Loader } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { formatMetadata } from 'lib/utils';
import { useRelationships } from 'lib/hooks/RelationshipHooks';
import { RelationshipList } from 'lib';
import { createLink } from '@cognite/cdf-utilities';

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

  const { data: relationships } = useRelationships(timeseries?.externalId);

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
          <Col span={18}>
            <TimeseriesChart
              timeseriesId={timeseries.id}
              height={500}
              defaultOption="2Y"
            />
            {formatMetadata((timeseries && timeseries.metadata) ?? {}).map(
              el => (
                <DetailsItem key={el.key} name={el.key} value={el.value} />
              )
            )}
          </Col>
          <Col span={6}>
            <RelationshipList
              assetId={timeseries.assetId}
              relations={relationships}
              onClick={item =>
                history.push(createLink(`/explore/${item.type}/${item.id}`))
              }
            />
          </Col>
        </Row>
      )}
    </>
  );
};
