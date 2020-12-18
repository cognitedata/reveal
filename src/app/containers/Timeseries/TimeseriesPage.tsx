import React from 'react';
import { useParams } from 'react-router-dom';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { PageTitle } from '@cognite/cdf-utilities';
import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesPage = () => {
  const { id: timeseriesIdString } = useParams<{
    id: string;
  }>();
  const timeseriesId = parseInt(timeseriesIdString, 10);

  const { data: timeseries } = useCdfItem<Timeseries>('timeseries', {
    id: timeseriesId,
  });

  if (!timeseriesIdString) {
    return null;
  }

  return (
    <>
      <PageTitle title={timeseries?.name} />
      <TimeseriesPreview timeseriesId={timeseriesId} />
    </>
  );
};
