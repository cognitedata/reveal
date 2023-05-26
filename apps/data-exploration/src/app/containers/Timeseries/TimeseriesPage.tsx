import React from 'react';
import { useParams } from 'react-router-dom';

import { PageTitle } from '@cognite/cdf-utilities';
import { Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesPage = () => {
  const { id: timeseriesIdString = '' } = useParams<{
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
