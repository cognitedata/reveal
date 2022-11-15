import React from 'react';

import { NamedProps } from 'react-select';
import ReactSelectCreatable, {
  Props as ReactSelectCreatableProps,
} from 'react-select/creatable';

import {
  OptionType,
  Select as CogsSelect,
  SelectProps as CogsSelectProps,
  Theme,
} from '@cognite/cogs.js';

export interface BaseSelectProps<ValueType>
  extends CogsSelectProps<ValueType>,
    Pick<NamedProps, 'styles' | 'onInputChange'> {
  creatable?: boolean;
  cogsTheme?: Theme;
}

export const BaseSelect = <ValueType,>({
  creatable = false,
  cogsTheme,
  ...rest
}: BaseSelectProps<ValueType>) => {
  const props: BaseSelectProps<ValueType> = {
    isClearable: true,
    closeMenuOnSelect: true,
    theme: cogsTheme,
    ...rest,
    styles: {
      ...rest.styles,
      control: (styles, styleProps) => ({
        ...styles,
        ...(rest.styles &&
          rest.styles.control &&
          rest.styles.control(styles, styleProps)),
        cursor: 'pointer',
      }),
      option: (styles, styleProps) => ({
        ...styles,
        ...(rest.styles &&
          rest.styles.option &&
          rest.styles.option(styles, styleProps)),
        cursor: 'pointer',
      }),
    },
  };

  if (creatable) {
    return (
      <ReactSelectCreatable
        {...(props as ReactSelectCreatableProps<OptionType<ValueType>>)}
        formatCreateLabel={input => `Use "${input}"`}
      />
    );
  }

  return <CogsSelect {...props} />;
};
