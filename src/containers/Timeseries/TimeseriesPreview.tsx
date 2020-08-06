import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { itemSelector, retrieve } from 'modules/timeseries';
import { Button, Icon } from '@cognite/cogs.js';
import { TimeseriesGraph, Wrapper } from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { useHistory } from 'react-router-dom';

const formatMetadata = (metadata: { [key: string]: any }) =>
  Object.keys(metadata).reduce(
    (agg, cur) => ({
      ...agg,
      [cur]: String(metadata[cur]) || '',
    }),
    {}
  );

export const TimeseriesPreview = ({
  timeseriesId,
  extraActions,
}: {
  timeseriesId: number;
  extraActions?: React.ReactNode[];
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const timeseries = useSelector(itemSelector)(timeseriesId);

  useEffect(() => {
    if (!timeseries) {
      dispatch(retrieve([{ id: timeseriesId }]));
    }
  }, [dispatch, timeseries, timeseriesId]);

  return (
    <Wrapper>
      <Button className="back-button" onClick={() => history.goBack()}>
        Back
      </Button>
      <h1>
        <Icon type="Timeseries" />
        {timeseries ? timeseries.name : 'Loading...'}
      </h1>
      {extraActions}
      {timeseries && (
        <>
          <TimeseriesGraph
            timeseries={timeseries}
            contextChart
            graphHeight={500}
          />
          <DescriptionList
            valueSet={formatMetadata(timeseries.metadata ?? {})}
          />
        </>
      )}
    </Wrapper>
  );
};
