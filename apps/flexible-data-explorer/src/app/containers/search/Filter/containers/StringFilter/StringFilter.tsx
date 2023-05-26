import * as React from 'react';

import { BaseFilterProps, Operator } from '../../types';
import { CommonFilter } from '../CommonFilter';

const CONFIG = {
  [Operator.STARTS_WITH]: 'string',
  [Operator.NOT_STARTS_WITH]: 'string',
  [Operator.CONTAINS]: 'string',
  [Operator.NOT_CONTAINS]: 'string',
  [Operator.IS_SET]: 'no-input',
  [Operator.IS_NOT_SET]: 'no-input',
} as const;

export type StringFilterProps = BaseFilterProps<typeof CONFIG>;

export const StringFilter: React.FC<StringFilterProps> = (props) => {
  return <CommonFilter config={CONFIG} {...props} />;
};
