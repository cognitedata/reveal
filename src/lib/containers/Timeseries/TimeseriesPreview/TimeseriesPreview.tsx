import React from 'react';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { DetailsItem, ErrorFeedback, Loader } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { formatMetadata } from 'lib/utils';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';

export const TimeseriesPreview = ({
  timeseriesId,
  extraActions,
}: {
  timeseriesId: number;
  extraActions?: React.ReactNode[];
}) => {
  const { data: timeseries, isFetched, error } = useCdfItem<Timeseries>(
    'timeseries',
    { id: timeseriesId }
  );

  const { data: relationships } = useRelationships(timeseries?.externalId);

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
      {extraActions}
      {timeseries && (
        <Row gutter={16}>
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
