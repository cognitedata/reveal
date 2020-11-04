import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { TimeseriesPreview } from 'lib';
import ResourceTitleRow from 'app/components/ResourceTitleRow';

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
  return (
    <>
      <ResourceTitleRow
        id={timeseriesIdNumber}
        type="timeSeries"
        icon="Timeseries"
      />
      <TimeseriesPreview timeseriesId={timeseriesIdNumber} />
    </>
  );
};
