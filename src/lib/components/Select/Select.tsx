/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import ReactSelectCreatable from 'react-select/creatable';
import ReactSelect, { Props, OptionTypeBase } from 'react-select';
import { Colors } from '@cognite/cogs.js';

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
    ...extraProps,
    styles: {
      ...extraProps.styles,
      control: (styles, styleProps) => ({
        ...styles,
        ...(extraProps.styles &&
          extraProps.styles.control &&
          extraProps.styles.control(styles, styleProps)),
        color: Colors['greyscale-grey8'].hex(),
        backgroundColor: Colors['greyscale-grey2'].hex(),
        fontWeight: 800,
        border: 'none',
      }),
    },
    theme: theme => ({
      ...theme,
      borderRadius: 4,
      colors: {
        ...theme.colors,
        primary25: Colors['greyscale-grey2'].hex(),
        primary: Colors.midblue.hex(),
        neutral: Colors['greyscale-grey2'].hex(),
      },
    }),
  };

  if (creatable) {
    return (
      <ReactSelectCreatable
        {...props}
        formatCreateLabel={input => `Use "${input}"`}
      />
    );
  }
  return <ReactSelect {...props} />;
};
