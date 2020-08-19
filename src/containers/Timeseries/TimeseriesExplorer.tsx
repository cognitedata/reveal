import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesExplorer = () => {
  const dispatch = useDispatch();
  const { timeseriesId } = useParams<{
    timeseriesId: string | undefined;
  }>();
  const timeseriesIdNumber = timeseriesId
    ? parseInt(timeseriesId, 10)
    : undefined;

  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el =>
      el.state === 'active' &&
      el.id === timeseriesIdNumber &&
      el.type === 'timeseries'
  );

  useEffect(() => {
    if (timeseriesIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([
            { id: timeseriesIdNumber, type: 'timeseries', state: 'active' },
          ])
      );
    }
  }, [isActive, resourcesState, timeseriesIdNumber, setResourcesState]);

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
