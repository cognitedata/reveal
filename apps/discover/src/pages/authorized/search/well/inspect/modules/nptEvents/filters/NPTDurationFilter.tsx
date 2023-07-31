import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { NumericRangeDropdown } from 'components/Filters';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useFilterDataNpt } from 'modules/inspectTabs/selectors';

import { NPT_DURATION_FILTER_TITLE } from './constants';

export const NPTDurationFilter = React.memo(
  ({ minMaxDuration }: { minMaxDuration: number[] }) => {
    const { duration } = useFilterDataNpt();
    const dispatch = useDispatch();

    const handleChangeDuration = useCallback((durationVals: number[]) => {
      dispatch(inspectTabsActions.setNptDuration(durationVals));
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
