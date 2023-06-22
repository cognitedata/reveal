import React, { FunctionComponent } from 'react';

import {
  updateStatusAction,
  useRunFilterContext,
} from '../../hooks/runs/RunsFilterContext';
import { RunStatus } from '../../model/Runs';
import { trackUsage } from '../../utils/Metrics';
import { StatusMenu } from '../menu/StatusMenu';

export const StatusFilterMenu: FunctionComponent = () => {
  const {
    state: { statuses },
    dispatch,
  } = useRunFilterContext();

  const updateStatus = (run?: RunStatus) => {
    trackUsage({ t: 'Filter', field: 'status', value: run ?? 'All' });
    dispatch(updateStatusAction(run ? [run] : []));
  };

  return (
    <StatusMenu
      setSelected={updateStatus}
      selected={statuses[0]}
      btnType="tertiary"
    />
  );
};
