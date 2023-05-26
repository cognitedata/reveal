import { components, MultiValueProps, OptionTypeBase } from 'react-select';

import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';

import { FormattedCount } from './elements';

export const MultiValue = <OptionType extends OptionTypeBase>({
  children,
  ...props
}: MultiValueProps<OptionType>) => {
  const index = get(props, 'index');

  if (isUndefined(index) || index > 1) {
    return null;
  }

  if (index === 0) {
    return <components.MultiValue {...props}>{children}</components.MultiValue>;
  }

  const { value } = props.selectProps;
  const selectedOptionsCount = isArray(value) ? value.length : 0;

  return <FormattedCount>+{selectedOptionsCount - 1}</FormattedCount>;
};
