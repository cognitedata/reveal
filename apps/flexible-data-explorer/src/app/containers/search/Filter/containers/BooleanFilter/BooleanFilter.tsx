import * as React from 'react';
import { useMemo } from 'react';

import { BaseFilterProps, BooleanOperator, Operator } from '../../types';
import { processFilterConfig } from '../../utils';
import { CommonFilter } from '../CommonFilter';

const CONFIG = {
  [Operator.IS_TRUE]: 'boolean',
  [Operator.IS_FALSE]: 'boolean',
  [Operator.IS_SET]: 'no-input',
  [Operator.IS_NOT_SET]: 'no-input',
} as const;

export type BooleanFilterProps = BaseFilterProps<BooleanOperator>;

export const BooleanFilter: React.FC<BooleanFilterProps> = ({
  operators,
  ...props
}) => {
  const config = useMemo(() => {
    return processFilterConfig(CONFIG, operators);
  }, [operators]);

  return <CommonFilter config={config} {...props} />;
};
