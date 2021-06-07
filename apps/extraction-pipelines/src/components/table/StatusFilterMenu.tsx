import React, { FunctionComponent } from 'react';
import { mapStatus, mapStatusRun } from 'utils/runsUtils';
import { RunStatusUI } from 'model/Status';
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
    state: { statuses },
    dispatch,
  } = useRunFilterContext();

  const updateStatus = (newStatus?: RunStatusUI) => {
    const run = mapStatusRun(newStatus);
    trackUsage(FILTER, { field: 'status', value: run ?? 'All' });
    dispatch(updateStatusAction(run ? [run] : []));
  };

  return (
    <StatusMenu
      setSelected={updateStatus}
      selected={mapStatus(statuses[0])}
      btnType="tertiary"
    />
  );
};
