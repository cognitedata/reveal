import React, { useEffect, useMemo } from 'react';
import { TimeseriesDetailsAbstract, Loader } from 'components/Common';
import {
  useResourcesDispatch,
  useResourcesSelector,
} from '@cognite/cdf-resources-store';
import {
  itemSelector,
  retrieve,
} from '@cognite/cdf-resources-store/dist/timeseries';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';

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
  const dispatch = useResourcesDispatch();
  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'timeSeries',
    id: timeseriesId,
  });

  useEffect(() => {
    dispatch(retrieve([{ id: timeseriesId }]));
  }, [dispatch, timeseriesId]);

  const timeseries = useResourcesSelector(itemSelector)(timeseriesId);

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [selectionButton];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: timeseriesId,
        type: 'timeSeries',
      })
    );
    return items;
  }, [selectionButton, renderResourceActions, timeseriesId, propActions]);

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
