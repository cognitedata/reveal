import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

import { InputType, Operator } from '../types';

export const processFilterConfig = <TOperator extends Operator>(
  config: Record<TOperator, InputType>,
  operators?: TOperator[]
) => {
  if (!operators || isEmpty(operators)) {
    return config;
  }

  return pick(config, operators);
};
