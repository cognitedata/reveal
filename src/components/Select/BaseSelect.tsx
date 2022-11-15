import React, { useMemo } from 'react';

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

const NIL_FILTER_OPTION: OptionType<null> = {
  label: 'N/A',
  value: null,
};
export interface BaseSelectProps<ValueType>
  extends CogsSelectProps<ValueType>,
    Pick<NamedProps, 'styles' | 'onInputChange'> {
  creatable?: boolean;
  cogsTheme?: Theme;
  addNilOption?: boolean;
}

export const BaseSelect = <ValueType,>({
  creatable = false,
  cogsTheme,
  addNilOption = false,
  options: optionsOriginal,
  ...rest
}: BaseSelectProps<ValueType>) => {
  const options = useMemo(() => {
    if (!addNilOption) {
      return optionsOriginal;
    }
    return [...optionsOriginal, NIL_FILTER_OPTION] as OptionType<ValueType>[];
  }, [optionsOriginal, addNilOption]);

  const props: BaseSelectProps<ValueType> = {
    isClearable: true,
    closeMenuOnSelect: true,
    theme: cogsTheme,
    options,
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
