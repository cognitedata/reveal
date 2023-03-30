import React, { useMemo } from 'react';
import styled from 'styled-components';

import { components, InputActionMeta, NamedProps } from 'react-select';

import {
  OptionType,
  Select as CogsSelect,
  SelectProps as CogsSelectProps,
  Theme,
  Tooltip,
} from '@cognite/cogs.js';

import { NIL_FILTER_LABEL, NIL_FILTER_VALUE } from '@data-exploration-lib/core';
import { Ellipsis } from '../Ellipsis';

export const NIL_FILTER_OPTION: OptionType<string> = {
  label: NIL_FILTER_LABEL,
  value: NIL_FILTER_VALUE,
};
export interface BaseSelectProps<ValueType>
  extends CogsSelectProps<ValueType>,
    Pick<NamedProps, 'styles' | 'onInputChange' | 'isLoading'> {
  creatable?: boolean;
  cogsTheme?: Theme;
  addNilOption?: boolean;
  isError?: boolean;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
}

const Option = ({ data, isSelected, ...props }: any) => {
  const optionValue = data.count
    ? `${data.label} (${data.count})`
    : `${data.label}`;
  return (
    <components.Option {...props} data={data} isSelected={isSelected}>
      <Ellipsis value={optionValue} />
    </components.Option>
  );
};

export const BaseSelect = <ValueType,>({
  cogsTheme,
  addNilOption = false,
  options: optionsOriginal,
  isError = false,
  isLoading,
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
    isError,
    isLoading,
    ...rest, // Better to put this prop close to styles and after 'theme' due to 'rest.styles'.
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

  // if (creatable) {
  //   return (
  //     <ReactSelectCreatable
  //       {...(props as ReactSelectCreatableProps<OptionType<ValueType>>)}
  //       formatCreateLabel={(input) => `Use "${input}"`}
  //       value={props.value ? props.value : null} // should pass null when clear selected items
  //       isDisabled={props.disabled}
  //     />
  //   );
  // }

  return (
    <Tooltip interactive disabled={!isError} content="No data found">
      <CogsSelectWrapper isError={isError}>
        <CogsSelect
          {...props}
          components={{ Option }}
          disabled={isError || isLoading}
        />
      </CogsSelectWrapper>
    </Tooltip>
  );
};

const CogsSelectWrapper = styled.div<{ isError: boolean }>`
  border: 1px solid
    ${(props) =>
      props.isError
        ? `var(--cogs-border--status-critical--strong)`
        : 'transparent'};
  border-radius: 4px;
`;
