import isEmpty from 'lodash/isEmpty';
import { OptionType } from '../types';

export const hasOptionWithChildOptions = (options: Array<OptionType>) => {
  return options.some((option) => !isEmpty(option.options));
};
