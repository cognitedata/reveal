import * as React from 'react';
import { useMemo } from 'react';

import { BaseFilterProps, DateOperator, Operator } from '../../types';
import { processFilterConfig } from '../../utils';
import { CommonFilter } from '../CommonFilter';

const CONFIG = {
  [Operator.BEFORE]: 'date',
  [Operator.NOT_BEFORE]: 'date',
  [Operator.BETWEEN]: 'date-range',
  [Operator.NOT_BETWEEN]: 'date-range',
  [Operator.AFTER]: 'date',
  [Operator.NOT_AFTER]: 'date',
  [Operator.ON]: 'date',
  [Operator.NOT_ON]: 'date',
  [Operator.IS_SET]: 'no-input',
  [Operator.IS_NOT_SET]: 'no-input',
} as const;

export type DateFilterProps = BaseFilterProps<DateOperator>;

export const DateFilter: React.FC<DateFilterProps> = ({
  operators,
  ...props
}) => {
  const config = useMemo(() => {
    return processFilterConfig(CONFIG, operators);
  }, [operators]);

  return <CommonFilter config={config} {...props} />;
};
