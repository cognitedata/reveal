import React, { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { NumericRangeDropdown } from 'components/filters';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataNpt } from 'modules/filterData/selectors';
import { NPTEvent } from 'modules/wellSearch/types';
import { getNPTFilterOptions } from 'modules/wellSearch/utils/events';

import { NPT_DURATION_FILTER_TITLE } from './constants';
import { isDurationEmpty } from './helpers';

export const NPTDurationFilter = React.memo(
  ({ events }: { events: NPTEvent[] }) => {
    const { minMaxDuration } = useMemo(
      () => getNPTFilterOptions(events),
      [events]
    );
    const { duration } = useFilterDataNpt();
    const dispatch = useDispatch();

    useEffect(() => {
      if (!isEmpty(events) && isDurationEmpty(duration)) {
        dispatch(filterDataActions.setNptDuration(minMaxDuration));
      }
    }, [events, minMaxDuration]);

    const handleChangeDuration = (durationVals: number[]) => {
      if (!durationVals || durationVals.length <= 1) return;
      if (!duration || duration.length <= 1) return;

      if (
        duration &&
        durationVals[0] === duration[0] &&
        durationVals[1] === duration[1]
      ) {
        return;
      }
      dispatch(filterDataActions.setNptDuration(durationVals));
    };

    return (
      <NumericRangeDropdown
        title={NPT_DURATION_FILTER_TITLE}
        range={minMaxDuration}
        onChange={handleChangeDuration}
      />
    );
  }
);
