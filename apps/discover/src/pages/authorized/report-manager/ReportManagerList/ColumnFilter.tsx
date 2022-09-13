import * as React from 'react';

import { Column } from '@tanstack/react-table';

import { Input } from '@cognite/cogs.js';

import ClickAwayListener from 'components/clickAwayListener';

import { StyledIcon, FloatingBox } from './elements';

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
    <>
      <StyledIcon
        type="Filter"
        onClick={toggleFilters}
        style={hasFilterApplied ? { color: 'blue' } : {}}
      />
      {showing && (
        <ClickAwayListener onClickAway={() => setShowing(false)}>
          <FloatingBox>
            <datalist id={id}>
              {sortedUniqueValues.slice(0, 5000).map((value: any) => (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                <option value={value} key={`${id}-${value}`} />
              ))}
            </datalist>
            <DebouncedInput
              value={(columnFilterValue ?? '') as string}
              onChange={(value) => column.setFilterValue(value)}
              placeholder={`Filter... (${
                column.getFacetedUniqueValues().size
              })`}
              list={id}
            />
          </FloatingBox>
        </ClickAwayListener>
      )}
    </>
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  placeholder: string;
  list: string;
  onChange: (value: string | number) => void;
  debounce?: number;
}) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      setValue={setValue}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
