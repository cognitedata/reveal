import React from 'react';
import ReactSelectCreatable from 'react-select/creatable';
import { Props, OptionTypeBase } from 'react-select';
import {
  Select as CogsSelect,
  SelectProps as CogsSelectProps,
} from '@cognite/cogs.js';

export type SelectProps<OptionType> = Props<OptionType> & {
  creatable?: boolean;
};

export const Select = <
  OptionType extends OptionTypeBase = { label: string; value: string }
>({
  creatable = false,
  ...extraProps
}: SelectProps<OptionType>) => {
  const props: Props<OptionType> = {
    isClearable: true,
    closeMenuOnSelect: true,
    ...extraProps,
    styles: {
      ...extraProps.styles,
      control: (styles, styleProps) => ({
        ...styles,
        ...(extraProps.styles &&
          extraProps.styles.control &&
          extraProps.styles.control(styles, styleProps)),
        cursor: 'pointer',
      }),
      option: (styles, styleProps) => ({
        ...styles,
        ...(extraProps.styles &&
          extraProps.styles.option &&
          extraProps.styles.option(styles, styleProps)),
        cursor: 'pointer',
      }),
    },
  };

  if (creatable) {
    return (
      <ReactSelectCreatable
        {...props}
        formatCreateLabel={input => `Use "${input}"`}
      />
    );
  }
  return <CogsSelect {...(props as CogsSelectProps)} />;
};
