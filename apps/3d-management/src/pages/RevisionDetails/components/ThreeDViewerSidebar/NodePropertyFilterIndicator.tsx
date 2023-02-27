import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { setNodePropertyFilter } from 'store/modules/toolbar';
import { Tooltip, Chip } from '@cognite/cogs.js';

export function NodePropertyFilterIndicator() {
  const dispatch = useDispatch();
  const { value: filterValue, isLoading } = useSelector(
    (state: RootState) => state.toolbar.nodePropertyFilter
  );

  if (!filterValue) {
    return null;
  }

  const getFilterLabel = (): string => {
    const filterKey = Object.keys(filterValue)[0];
    const [key, val] = Object.entries(filterValue[filterKey])[0];
    return `${key}: ${val}`;
  };

  return (
    <Tooltip content={`Filter: ${JSON.stringify(filterValue)}`}>
      <Chip
        size="x-small"
        type="neutral"
        label={isLoading ? 'Loading filter...' : getFilterLabel()}
        onRemove={() => dispatch(setNodePropertyFilter(null))}
      />
    </Tooltip>
  );
}
