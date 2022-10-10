import React from 'react';
import ReactSelectCreatable from 'react-select/creatable';
import { Props, OptionTypeBase } from 'react-select';
import {
  Select as CogsSelect,
  SelectProps as CogsSelectProps,
  Theme,
} from '@cognite/cogs.js';

export type SelectProps<OptionType> = Props<OptionType> & {
  creatable?: boolean;
  cogsTheme?: Theme;
};

export const Select = <
  OptionType extends OptionTypeBase = { label: string; value: string }
>({
  creatable = false,
  cogsTheme,
  ...extraProps
}: SelectProps<OptionType>) => {
  const props: Props<OptionType> = {
    isClearable: true,
    closeMenuOnSelect: true,
    theme: cogsTheme as any,
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
        formatCreateLabel={(input: string) => `Use "${input}"`}
      />
    );
  }
  return <CogsSelect {...(props as unknown as CogsSelectProps<OptionType>)} />;
};
