import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'utils/Metrics';
import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesPage = () => {
  const { timeseriesId } = useParams<{
    timeseriesId: string | undefined;
  }>();
  const timeseriesIdNumber = timeseriesId
    ? parseInt(timeseriesId, 10)
    : undefined;

  useEffect(() => {
    trackUsage('Exploration.Timeseries', { timeseriesId: timeseriesIdNumber });
  }, [timeseriesIdNumber]);

  if (
    !timeseriesId ||
    !timeseriesIdNumber ||
    !Number.isFinite(timeseriesIdNumber)
  ) {
    return <>Invalid time series id {timeseriesId}</>;
  }
  return <TimeseriesPreview timeseriesId={timeseriesIdNumber} />;
};
