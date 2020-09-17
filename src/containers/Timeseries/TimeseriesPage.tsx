import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from '@cognite/cdf-resources-store/dist/files';
import { useResourcesDispatch } from '@cognite/cdf-resources-store';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { TimeseriesPreview } from './TimeseriesPreview';

export const TimeseriesPage = () => {
  const dispatch = useResourcesDispatch();
  const { timeseriesId } = useParams<{
    timeseriesId: string | undefined;
  }>();
  const timeseriesIdNumber = timeseriesId
    ? parseInt(timeseriesId, 10)
    : undefined;

  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const { hidePreview } = useResourcePreview();
  const isActive = resourcesState.some(
    el =>
      el.state === 'active' &&
      el.id === timeseriesIdNumber &&
      el.type === 'timeSeries'
  );

  useEffect(() => {
    if (timeseriesIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([
            { id: timeseriesIdNumber, type: 'timeSeries', state: 'active' },
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
      })();
    }
    hidePreview();
  }, [dispatch, timeseriesIdNumber, hidePreview]);

  if (!timeseriesIdNumber) {
    return <Loader />;
  }
  return <TimeseriesPreview timeseriesId={timeseriesIdNumber} />;
};
