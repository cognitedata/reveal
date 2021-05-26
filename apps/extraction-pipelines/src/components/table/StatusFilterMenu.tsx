import React, { FunctionComponent } from 'react';
import { mapStatus, mapStatusRun } from 'utils/runsUtils';
import { Status } from 'model/Status';
import { StatusMenu } from 'components/menu/StatusMenu';
import { trackUsage } from 'utils/Metrics';
import { FILTER } from 'utils/constants';
import {
  updateStatusAction,
  useRunFilterContext,
} from 'hooks/runs/RunsFilterContext';

interface StatusFilterMenuProps {}

export const StatusFilterMenu: FunctionComponent<StatusFilterMenuProps> = () => {
  const {
    state: { status },
    dispatch,
  } = useRunFilterContext();

  const updateStatus = (newStatus?: Status) => {
    const run = mapStatusRun(newStatus);
    trackUsage(FILTER, { field: 'status', value: run ?? 'All' });
    dispatch(updateStatusAction(run));
  };

  return (
    <StatusMenu
      setSelected={updateStatus}
      selected={mapStatus(status)}
      btnType="tertiary"
    />
  );
};
