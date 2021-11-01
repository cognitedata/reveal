import React from 'react';
import { Row } from 'react-table';
import { RunStatusUI } from 'model/Status';
import { StatusMenu } from 'components/menu/StatusMenu';

import { trackUsage } from 'utils/Metrics';

interface StatusFilterTableDropdownProps<D extends object> {
  column: {
    id: string;
    filterValue: RunStatusUI;
    setFilter: (filter: RunStatusUI | undefined) => void;
    preFilteredRows: Array<Row<D>>;
    Header: string;
  };
}

const StatusFilterTableDropdown = <D extends object>({
  column: { filterValue, setFilter },
}: StatusFilterTableDropdownProps<D>) => {
  const onClick = (status?: RunStatusUI) => {
    trackUsage({ t: 'Filter', field: 'status', value: status ?? 'All' });
    setFilter(status);
  };

  return <StatusMenu setSelected={onClick} selected={filterValue} />;
};
export default StatusFilterTableDropdown;
