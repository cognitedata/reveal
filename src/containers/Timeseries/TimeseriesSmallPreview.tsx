import React, { useMemo } from 'react';
import {
  ErrorFeedback,
  Loader,
  TimeseriesDetailsAbstract,
} from 'components/Common';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';
import { useCdfItems } from 'hooks/sdk';
import { Timeseries } from '@cognite/sdk';

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
  // There is no GET /timeseries/id api
  const { data = [], isFetched, error } = useCdfItems<Timeseries>(
    'timeseries',
    [{ id: timeseriesId }]
  );
  const timeseries = isFetched && data[0];

  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'timeSeries',
    id: timeseriesId,
  });

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

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Time series {timeseriesId} not found!</>;
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
