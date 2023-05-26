import * as React from 'react';

import { BaseFilterProps, Operator } from '../../types';
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

export type DateFilterProps = BaseFilterProps<typeof CONFIG>;

export const DateFilter: React.FC<DateFilterProps> = (props) => {
  return <CommonFilter config={CONFIG} {...props} />;
};
