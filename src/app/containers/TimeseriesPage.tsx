import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { DetailsItem, ErrorFeedback, Loader } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { formatMetadata } from 'lib/utils';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';

export const TimeseriesPage = () => {
  const { timeseriesId: timeseriesIdString } = useParams<{
    timeseriesId: string;
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
            <ResourceDetailsSidebar
              assetId={timeseries.assetId}
              relations={relationships}
            />
          </Col>
        </Row>
      )}
    </>
  );
};
