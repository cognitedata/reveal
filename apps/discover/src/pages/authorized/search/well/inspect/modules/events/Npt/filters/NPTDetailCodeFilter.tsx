import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { MultiSelect } from 'components/filters';
import { useDeepMemo } from 'hooks/useDeep';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataNpt } from 'modules/filterData/selectors';
import { NPT_DETAIL_CODE } from 'modules/wellSearch/constantsSidebarFilters';

import {
  FILTER_THEME,
  SELECT_ALL_LABEL,
  SELECTED_ALL_DISPLAY_VALUE,
} from './constants';

export const NPTDetailCodeFilter = React.memo(
  ({ nptDetailCodes }: { nptDetailCodes: string[] }) => {
    const { nptDetailCode } = useFilterDataNpt();
    const dispatch = useDispatch();

    const displayValue = useDeepMemo(() => {
      if (nptDetailCode.length === 1) return nptDetailCode[0];
      if (nptDetailCode.length === nptDetailCodes.length)
        return SELECTED_ALL_DISPLAY_VALUE;
      return undefined;
    }, [nptDetailCode, nptDetailCodes]);

    const handleValueChange = useCallback((values: string[]) => {
      dispatch(filterDataActions.setNptDetailCode(values));
    }, []);

    return (
      <MultiSelect
        theme={FILTER_THEME}
        title={NPT_DETAIL_CODE}
        SelectAllLabel={SELECT_ALL_LABEL}
        options={nptDetailCodes}
        selectedOptions={nptDetailCode}
        onValueChange={handleValueChange}
        enableSelectAll
        showCustomCheckbox
        showSelectedItemCount={nptDetailCode.length > 1}
        displayValue={displayValue}
        hideClearIndicator
      />
    );
  }
);
