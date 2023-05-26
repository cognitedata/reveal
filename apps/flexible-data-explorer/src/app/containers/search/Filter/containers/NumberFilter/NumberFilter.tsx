import * as React from 'react';

import { BaseFilterProps, Operator } from '../../types';
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

export type NumberFilterProps = BaseFilterProps<typeof CONFIG>;

export const NumberFilter: React.FC<NumberFilterProps> = (props) => {
  return <CommonFilter config={CONFIG} {...props} />;
};
