import React from 'react';
import { FilterValue, Row, useAsyncDebounce } from 'react-table';
import { Icon, Input } from '@cognite/cogs.js';

import { trackUsage } from 'utils/Metrics';

interface GlobalSearchProps<D extends object> {
  preGlobalFilteredRows: Array<Row<D>>;
  globalFilter: any;
  setGlobalFilter: (filterValue: FilterValue) => void;
}

const ExtpipeTableSearch = <D extends object>({
  // preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}: GlobalSearchProps<D>) => {
  // const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((val) => {
    trackUsage({ t: 'Search', query: val });
    setGlobalFilter(val || []);
  }, 200);
  return (
    <Input
      aria-describedby="tippy-1"
      value={value || ''}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      icon={<Icon type="Search" />}
      iconPlacement="right"
      placeholder="Search"
      data-testid="search-extpipes"
      id="search-extpipes"
    />
  );
};
export default ExtpipeTableSearch;
