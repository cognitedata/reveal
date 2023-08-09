import * as React from 'react';
import { useMemo, useState } from 'react';

import isString from 'lodash/isString';
import max from 'lodash/max';
import min from 'lodash/min';
import { useDebounce } from 'use-debounce';

import { useTranslation } from '../../../../hooks/useTranslation';
import { useSearchAggregateValuesQuery } from '../../../../services/dataTypes/queries/useSearchAggregatesQuery';
import { ApplyButton, Menu, MenuHeader, Select } from '../../components';
import { Field, FieldValue, Operator, ValueType } from '../../types';
import { isNoInputOperator } from '../../utils';

import { CommonFilterInput } from './CommonFilterInput';
import {
  getInitialOperator,
  getInputType,
  getOperators,
  isApplyButtonDisabled,
} from './utils';

export interface CommonFilterProps {
  dataType: string;
  field: Field;
  value?: FieldValue;
  onBackClick: () => void;
  onApplyClick: (operator: Operator, value: ValueType) => void;
}

export const CommonFilter: React.FC<CommonFilterProps> = ({
  dataType,
  field,
  value: fieldValue,
  onBackClick,
  onApplyClick,
}) => {
  const { t } = useTranslation();

  const operators = useMemo(() => {
    return getOperators(field);
  }, [field]);

  const [operator, setOperator] = useState<Operator>(
    getInitialOperator(operators, fieldValue)
  );

  const [value, setValue] = useState<ValueType | undefined>(fieldValue?.value);
  const [debouncedValue] = useDebounce(value, 300);

  const inputType = useMemo(() => {
    return getInputType(field.type, operator);
  }, [field.type, operator]);

  const applyButtonDisabled = isApplyButtonDisabled(inputType, value);

  const handleChangeOperator = (newOperator: Operator) => {
    setOperator(newOperator);

    const newInputType = getInputType(field.type, operator);
    if (inputType !== newInputType || isNoInputOperator(newOperator)) {
      setValue(undefined);
    }
  };

  const handleApplyClick = () => {
    onApplyClick(operator, value!);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!applyButtonDisabled && (e.key === 'Enter' || e.keyCode === 13)) {
      (e.target as any).blur();
      handleApplyClick();
    }
  };

  const { data: suggestions = [], isLoading: isSuggestionsLoading } =
    useSearchAggregateValuesQuery({
      dataType,
      field: field.name,
      query: isString(debouncedValue) ? debouncedValue : '',
    });

  const helpText = useMemo(() => {
    if (operator === Operator.GREATER_THAN) {
      const dataMax = max(suggestions);
      if (dataMax) {
        return t('FILTER_INPUT_MAX', { value: dataMax });
      }
      return undefined;
    }

    if (operator === Operator.LESS_THAN) {
      const dataMin = min(suggestions);
      if (dataMin) {
        return t('FILTER_INPUT_MIN', { value: dataMin });
      }
      return undefined;
    }

    return undefined;
  }, [operator, suggestions, t]);

  return (
    <div onKeyUp={handleEnterPress}>
      <Menu>
        <MenuHeader
          title={field.name}
          subtitle={dataType}
          onBackClick={onBackClick}
        />

        <Select<Operator>
          options={operators}
          value={operator}
          onChange={handleChangeOperator}
        />

        <CommonFilterInput
          type={inputType}
          operator={operator}
          value={value}
          onChange={setValue}
          suggestions={suggestions}
          isSuggestionsLoading={isSuggestionsLoading}
          helpText={helpText}
        />

        <ApplyButton
          disabled={applyButtonDisabled}
          onClick={handleApplyClick}
        />
      </Menu>
    </div>
  );
};
