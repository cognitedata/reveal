import * as React from 'react';
import { useMemo } from 'react';

import { BaseFilterProps, NumberOperator, Operator } from '../../types';
import { processFilterConfig } from '../../utils';
import { CommonFilter } from '../CommonFilter';

const CONFIG = {
  [Operator.BETWEEN]: 'numeric-range',
  [Operator.NOT_BETWEEN]: 'numeric-range',
  [Operator.GREATER_THAN]: 'number',
  [Operator.LESS_THAN]: 'number',
  [Operator.EQUALS]: 'number',
  [Operator.NOT_EQUALS]: 'number',
  [Operator.IS_SET]: 'no-input',
  [Operator.IS_NOT_SET]: 'no-input',
} as const;

export type NumberFilterProps = BaseFilterProps<NumberOperator>;

export const NumberFilter: React.FC<NumberFilterProps> = ({
  operators,
  ...props
}) => {
  const config = useMemo(() => {
    return processFilterConfig(CONFIG, operators);
  }, [operators]);

  return <CommonFilter config={config} {...props} />;
};
