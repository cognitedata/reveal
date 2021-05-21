import React, {
  Dispatch,
  FunctionComponent,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';
import { mapStatusRun, RunStatus } from 'utils/runsUtils';
import { Status } from 'model/Status';
import { StatusMenu } from 'components/menu/StatusMenu';
import { trackUsage } from 'utils/Metrics';
import { FILTER } from 'utils/constants';

interface StatusFilterMenuProps {
  setStatus: Dispatch<SetStateAction<RunStatus | undefined>>;
}

export const StatusFilterMenu: FunctionComponent<StatusFilterMenuProps> = ({
  setStatus,
}: PropsWithChildren<StatusFilterMenuProps>) => {
  const [selected, setSelected] = useState<Status | undefined>();

  const updateStatus = (status?: Status) => {
    const run = mapStatusRun(status);
    trackUsage(FILTER, { field: 'status', value: run ?? 'All' });
    setStatus(run);
    setSelected(status);
  };

  return (
    <StatusMenu
      setSelected={updateStatus}
      selected={selected}
      btnType="tertiary"
    />
  );
};
