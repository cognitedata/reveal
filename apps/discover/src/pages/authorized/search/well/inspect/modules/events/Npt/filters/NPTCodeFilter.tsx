import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { MultiSelect } from 'components/filters';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataNpt } from 'modules/filterData/selectors';
import { NPTEvent } from 'modules/wellSearch/types';
import { getNPTFilterOptions } from 'modules/wellSearch/utils/events';

import {
  FILTER_THEME,
  SELECT_ALL_LABEL,
  SELECTED_ALL_DISPLAY_VALUE,
  NPT_CODE_FILTER_TITLE,
} from './constants';

export const NPTCodeFilter = React.memo(
  ({ events }: { events: NPTEvent[] }) => {
    const { nptCodes } = useMemo(() => getNPTFilterOptions(events), [events]);
    const { nptCode } = useFilterDataNpt();
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(filterDataActions.setNptCode(nptCodes));
    }, []);

    const displayValue = useMemo(() => {
      if (nptCode.length === 1) return nptCode[0];
      if (nptCode.length === nptCodes.length) return SELECTED_ALL_DISPLAY_VALUE;
      return undefined;
    }, [nptCode, nptCodes]);

    return (
      <MultiSelect
        theme={FILTER_THEME}
        title={NPT_CODE_FILTER_TITLE}
        SelectAllLabel={SELECT_ALL_LABEL}
        options={nptCodes}
        selectedOptions={nptCode}
        onValueChange={(values: string[]) =>
          dispatch(filterDataActions.setNptCode(values))
        }
        enableSelectAll
        showCustomCheckbox
        showSelectedItemCount={nptCode.length > 1}
        displayValue={displayValue}
        hideClearIndicator
      />
    );
  }
);
