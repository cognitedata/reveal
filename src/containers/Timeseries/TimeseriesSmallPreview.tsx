import React, { useEffect } from 'react';
import { TimeseriesDetailsAbstract, Loader } from 'components/Common';
import { useDispatch, useSelector } from 'react-redux';
import { itemSelector, retrieve } from 'modules/timeseries';
import { useResourceActionsContext } from 'context/ResourceActionsContext';

export const TimeseriesSmallPreview = ({
  timeseriesId,
  actions: propActions,
  extras,
  children,
}: {
  timeseriesId: number;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
}) => {
  const dispatch = useDispatch();
  const renderResourceActions = useResourceActionsContext();

  useEffect(() => {
    dispatch(retrieve([{ id: timeseriesId }]));
  }, [dispatch, timeseriesId]);

  const timeseries = useSelector(itemSelector)(timeseriesId);

  const actions: React.ReactNode[] = [];
  actions.push(...(propActions || []));
  actions.push(
    ...renderResourceActions({
      timeseriesId,
    })
  );

  if (!timeseries) {
    return <Loader />;
  }
  return (
    <TimeseriesDetailsAbstract
      key={timeseries.id}
      timeSeries={timeseries}
      extras={extras}
      actions={actions}
    >
      {children}
    </TimeseriesDetailsAbstract>
  );
};
