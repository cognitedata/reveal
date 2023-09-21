import React, { useMemo } from 'react';
import { components, NamedProps } from 'react-select';

import ReactSelectCreatable, {
  Props as ReactSelectCreatableProps,
} from 'react-select/creatable';

import {
  OptionType,
  Select as CogsSelect,
  SelectProps as CogsSelectProps,
  Theme,
} from '@cognite/cogs.js';

import {
  NIL_FILTER_LABEL,
  NIL_FILTER_VALUE,
} from '@data-exploration-lib/domain-layer';

import { Ellipsis } from '../Ellipsis/Ellipsis';

export const NIL_FILTER_OPTION: OptionType<string> = {
  label: NIL_FILTER_LABEL,
  value: NIL_FILTER_VALUE,
};
export interface BaseSelectProps<ValueType>
  extends CogsSelectProps<ValueType>,
    Pick<NamedProps, 'styles' | 'onInputChange'> {
  creatable?: boolean;
  cogsTheme?: Theme;
  addNilOption?: boolean;
}

const Option = ({ data, isSelected, ...props }: any) => {
  return (
    <components.Option {...props} data={data} isSelected={isSelected}>
      <Ellipsis value={data.label} />
    </components.Option>
  );
};

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
      multiValue: (styles, styleProps) => ({
        ...styles,
        ...(rest.styles &&
          rest.styles.multiValue &&
          rest.styles.multiValue(styles, styleProps)),
        background: 'var(--cogs-surface--status-success--muted--default)',
        color: 'var(--cogs-text-icon--status-success)',
        borderRadius: 4,
      }),
      multiValueLabel: (styles, styleProps) => ({
        ...styles,
        ...(rest.styles &&
          rest.styles.multiValueLabel &&
          rest.styles.multiValueLabel(styles, styleProps)),
        color: 'var(--cogs-text-icon--status-success)',
        fontWeight: 500,
      }),
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
        // @ts-ignore
        {...(props as ReactSelectCreatableProps<OptionType<ValueType>>)}
        formatCreateLabel={(input) => `Use "${input}"`}
        value={props.value ? props.value : null} // should pass null when clear selected items
        isDisabled={props.disabled}
      />
    );
  }

  return <CogsSelect {...props} components={{ Option }} />;
};
