import React, { FunctionComponent } from 'react';
import { StatusMenu } from 'components/menu/StatusMenu';
import {
  updateStatusAction,
  useRunFilterContext,
} from 'hooks/runs/RunsFilterContext';

import { trackUsage } from 'utils/Metrics';
import { RunStatus } from 'model/Runs';

interface StatusFilterMenuProps {}

export const StatusFilterMenu: FunctionComponent<
  StatusFilterMenuProps
> = () => {
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
