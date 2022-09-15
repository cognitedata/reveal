import * as React from 'react';

import { Column } from '@tanstack/react-table';

import { Dropdown } from 'components/Dropdown';

import { DebouncedInput } from './DebouncedInput';
import { StyledIcon } from './elements';

export function ColumnFilter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = React.useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  const hasFilterApplied = !!columnFilterValue;

  const [showing, setShowing] = React.useState(false);

  const toggleFilters = () => setShowing(!showing);

  const id = `${column.id}-filter-list`;

  return (
    <Dropdown
      content={
        <>
          <datalist id={id}>
            {sortedUniqueValues.slice(0, 5000).map((value: any) => (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label
              <option value={value} key={`${id}-${value}`} />
            ))}
          </datalist>
          <DebouncedInput
            value={(columnFilterValue ?? '') as string}
            onChange={(value) => column.setFilterValue(value)}
            placeholder={`Filter... (${column.getFacetedUniqueValues().size})`}
            list={id}
          />
        </>
      }
    >
      <StyledIcon
        type="Filter"
        onClick={toggleFilters}
        style={
          hasFilterApplied
            ? { color: 'var(--cogs-text-icon--interactive--default)' }
            : { color: 'var(--cogs-text-icon--interactive--disabled)' }
        }
      />
    </Dropdown>
  );
}
