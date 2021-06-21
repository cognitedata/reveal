import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { setNodePropertyFilter } from 'src/store/modules/toolbar';

export function NodePropertyFilterIndicator() {
  const dispatch = useDispatch();
  const { value, isLoading } = useSelector(
    (state: RootState) => state.toolbar.nodePropertyFilter
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {JSON.stringify(value)}
      <button
        type="button"
        onClick={() => dispatch(setNodePropertyFilter(null))}
      >
        Remove
      </button>
    </div>
  );
}
