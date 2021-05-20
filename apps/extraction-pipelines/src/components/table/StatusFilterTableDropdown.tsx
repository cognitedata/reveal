import React from 'react';
import { Row } from 'react-table';
import { Status } from 'model/Status';
import { trackUsage } from 'utils/Metrics';
import { FILTER } from 'utils/constants';
import { StatusMenu } from 'components/menu/StatusMenu';

interface StatusFilterTableDropdownProps<D extends object> {
  column: {
    id: string;
    filterValue?: Status;
    setFilter: (filter: Status | undefined) => void;
    preFilteredRows: Array<Row<D>>;
    Header: string;
  };
}

const StatusFilterTableDropdown = <D extends object>({
  column: { filterValue, setFilter },
}: StatusFilterTableDropdownProps<D>) => {
  const onClick = (status?: Status) => {
    trackUsage(FILTER, { field: 'status', value: status ?? 'All' });
    setFilter(status);
  };

  return <StatusMenu setSelected={onClick} selected={filterValue} />;
};
export default StatusFilterTableDropdown;
