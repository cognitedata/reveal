import React from 'react';
import { FilterValue, Row, useAsyncDebounce } from 'react-table';
import { Input, Tooltip } from '@cognite/cogs.js';

interface GlobalSearchProps<D extends object> {
  preGlobalFilteredRows: Array<Row<D>>;
  globalFilter: any;
  setGlobalFilter: (filterValue: FilterValue) => void;
}

function IntegrationTableSearch<D extends object>({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}: GlobalSearchProps<D>) {
  // console.log('preGlobalFilteredRows', preGlobalFilteredRows)
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((val) => {
    setGlobalFilter(val || []);
  }, 200);
  return (
    <span>
      <Tooltip
        content="Search will filter table based on search criteria. Search eg. integration name, name of users etc."
        placement="top-start"
      >
        <Input
          title="Search all integrations"
          aria-describedby="tippy-1"
          value={value || ''}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={`${count} records...`}
          data-testid="search-integrations"
          id="search-integrations"
        />
      </Tooltip>
    </span>
  );
}
export default IntegrationTableSearch;
