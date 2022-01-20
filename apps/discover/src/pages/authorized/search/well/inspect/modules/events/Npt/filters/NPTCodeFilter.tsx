import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { MultiSelect } from 'components/filters';
import { useDeepMemo } from 'hooks/useDeep';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataNpt } from 'modules/filterData/selectors';

import {
  FILTER_THEME,
  SELECT_ALL_LABEL,
  SELECTED_ALL_DISPLAY_VALUE,
  NPT_CODE_FILTER_TITLE,
} from './constants';

export const NPTCodeFilter = React.memo(
  ({ nptCodes }: { nptCodes: string[] }) => {
    const { nptCode } = useFilterDataNpt();
    const dispatch = useDispatch();

    const displayValue = useDeepMemo(() => {
      if (nptCode.length === 1) return nptCode[0];
      if (nptCode.length === nptCodes.length) return SELECTED_ALL_DISPLAY_VALUE;
      return undefined;
    }, [nptCode, nptCodes]);

    const handleValueChange = useCallback((values: string[]) => {
      dispatch(filterDataActions.setNptCode(values));
    }, []);

    return (
      <MultiSelect
        theme={FILTER_THEME}
        title={NPT_CODE_FILTER_TITLE}
        SelectAllLabel={SELECT_ALL_LABEL}
        options={nptCodes}
        selectedOptions={nptCode}
        onValueChange={handleValueChange}
        enableSelectAll
        showCustomCheckbox
        showSelectedItemCount={nptCode.length > 1}
        displayValue={displayValue}
        hideClearIndicator
      />
    );
  }
);
