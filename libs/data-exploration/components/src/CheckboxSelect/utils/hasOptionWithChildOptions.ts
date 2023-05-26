import isEmpty from 'lodash/isEmpty';

import { CustomMetadataValue, OptionType } from '../types';

export const hasOptionWithChildOptions = (
  options: Array<OptionType>,
  useCustomMetadataValuesQuery?: CustomMetadataValue
) => {
  return (
    !!useCustomMetadataValuesQuery ||
    options.some((option) => !isEmpty(option.options))
  );
};
