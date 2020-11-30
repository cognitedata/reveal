import React from 'react';
import { useParams } from 'react-router-dom';
import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesPage = () => {
  const { id: timeseriesIdString } = useParams<{
    id: string;
  }>();
  const timeseriesId = parseInt(timeseriesIdString, 10);

  if (!timeseriesIdString) {
    return null;
  }

  return (
    <TimeseriesPreview
      timeseriesId={timeseriesId}
      actions={['Download', 'Collections', 'Copy']}
    />
  );
};
