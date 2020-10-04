/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import ReactSelect, { Props, OptionTypeBase } from 'react-select';
import { Colors } from '@cognite/cogs.js';

export const Select = <
  OptionType extends OptionTypeBase = { label: string; value: string }
>(
  props: Props<OptionType>
) => {
  return (
    <ReactSelect
      isClearable
      {...props}
      styles={{
        ...props.styles,
        control: (styles, styleProps) => ({
          ...styles,
          ...(props.styles &&
            props.styles.control &&
            props.styles.control(styles, styleProps)),
          color: Colors['greyscale-grey8'].hex(),
          backgroundColor: Colors['greyscale-grey2'].hex(),
          fontWeight: 800,
          border: 'none',
        }),
      }}
      theme={theme => ({
        ...theme,
        borderRadius: 4,
        colors: {
          ...theme.colors,
          primary25: Colors['greyscale-grey2'].hex(),
          primary: Colors.midblue.hex(),
          neutral: Colors['greyscale-grey2'].hex(),
        },
      })}
    />
  );
};
