import * as React from 'react';
import { useMemo } from 'react';

import { BaseFilterProps, Operator, StringOperator } from '../../types';
import { processFilterConfig } from '../../utils';
import { CommonFilter } from '../CommonFilter';

export const CONFIG = {
  [Operator.STARTS_WITH]: 'string',
  [Operator.NOT_STARTS_WITH]: 'string',
  [Operator.CONTAINS]: 'string',
  [Operator.NOT_CONTAINS]: 'string',
  [Operator.IS_SET]: 'no-input',
  [Operator.IS_NOT_SET]: 'no-input',
} as const;

export type StringFilterProps = BaseFilterProps<StringOperator>;

export const StringFilter: React.FC<StringFilterProps> = ({
  operators,
  ...props
}) => {
  const config = useMemo(() => {
    return processFilterConfig(CONFIG, operators);
  }, [operators]);

  return <CommonFilter config={config} {...props} />;
};
