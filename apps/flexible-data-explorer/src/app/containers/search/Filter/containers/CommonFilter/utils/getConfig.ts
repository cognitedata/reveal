import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

import { Field } from '../../../types';
import { CONFIG } from '../config';

export const getConfig = (field: Field) => {
  const defaultConfig = CONFIG[field.type];

  const { operators } = field;

  if (operators && !isEmpty(operators)) {
    return pick(defaultConfig, operators);
  }

  return defaultConfig;
};
