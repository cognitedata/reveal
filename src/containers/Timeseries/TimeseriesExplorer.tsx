import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesExplorer = () => {
  const dispatch = useDispatch();
  const { timeseriesId } = useParams<{
    timeseriesId: string | undefined;
  }>();
  const timeseriesIdNumber = timeseriesId
    ? parseInt(timeseriesId, 10)
    : undefined;

  useEffect(() => {
    trackUsage('Exploration.Timeseries', { timeseriesId: timeseriesIdNumber });
  }, [timeseriesIdNumber]);

  useEffect(() => {
    if (timeseriesIdNumber) {
      (async () => {
        await dispatch(retrieveFile([{ id: timeseriesIdNumber }]));
        await dispatch(listByFileId(timeseriesIdNumber));
      })();
    }
  }, [dispatch, timeseriesIdNumber]);

  if (!timeseriesIdNumber) {
    return <Loader />;
  }
  return <TimeseriesPreview timeseriesId={timeseriesIdNumber} />;
};
