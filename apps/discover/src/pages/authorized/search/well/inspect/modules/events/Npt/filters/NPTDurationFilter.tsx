import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { NumericRangeDropdown } from 'components/filters';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataNpt } from 'modules/filterData/selectors';

import { NPT_DURATION_FILTER_TITLE } from './constants';

export const NPTDurationFilter = React.memo(
  ({ minMaxDuration }: { minMaxDuration: number[] }) => {
    const { duration } = useFilterDataNpt();
    const dispatch = useDispatch();

    const handleChangeDuration = useCallback((durationVals: number[]) => {
      dispatch(filterDataActions.setNptDuration(durationVals));
    }, []);

    return (
      <NumericRangeDropdown
        title={NPT_DURATION_FILTER_TITLE}
        range={minMaxDuration}
        selectedRange={duration}
        onChange={handleChangeDuration}
      />
    );
  }
);
