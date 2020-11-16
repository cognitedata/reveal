import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesPage = () => {
  const { id: timeseriesIdString } = useParams<{
    id: string;
  }>();
  const timeseriesId = parseInt(timeseriesIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.TimeseriesPage', { timeseriesId });
  }, [timeseriesId]);

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
