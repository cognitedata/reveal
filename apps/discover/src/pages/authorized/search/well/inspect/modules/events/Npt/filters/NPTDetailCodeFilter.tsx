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
  NPT_DETAIL_CODE_FILTER_TITLE,
} from './constants';

export const NPTDetailCodeFilter = React.memo(
  ({ events }: { events: NPTEvent[] }) => {
    const { nptDetailCodes } = useMemo(
      () => getNPTFilterOptions(events),
      [events]
    );
    const { nptDetailCode } = useFilterDataNpt();
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(filterDataActions.setNptDetailCode(nptDetailCodes));
    }, []);

    const displayValue = useMemo(() => {
      if (nptDetailCode.length === 1) return nptDetailCode[0];
      if (nptDetailCode.length === nptDetailCodes.length)
        return SELECTED_ALL_DISPLAY_VALUE;
      return undefined;
    }, [nptDetailCode, nptDetailCodes]);

    return (
      <MultiSelect
        theme={FILTER_THEME}
        title={NPT_DETAIL_CODE_FILTER_TITLE}
        SelectAllLabel={SELECT_ALL_LABEL}
        options={nptDetailCodes}
        selectedOptions={nptDetailCode}
        onValueChange={(values: string[]) =>
          dispatch(filterDataActions.setNptDetailCode(values))
        }
        enableSelectAll
        showCustomCheckbox
        showSelectedItemCount={nptDetailCode.length > 1}
        displayValue={displayValue}
        hideClearIndicator
      />
    );
  }
);
