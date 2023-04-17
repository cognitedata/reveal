import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { InputActionMeta, NamedProps } from 'react-select';

import {
  OptionType,
  Select as CogsSelect,
  SelectProps as CogsSelectProps,
  Theme,
  Tooltip,
} from '@cognite/cogs.js';

import { NIL_FILTER_LABEL, NIL_FILTER_VALUE } from '@data-exploration-lib/core';
import { Option, MultiValue, MenuList } from './components';

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

export const BaseSelect = <ValueType,>({
  cogsTheme,
  addNilOption = false,
  options: optionsOriginal,
  isError = false,
  isLoading,
  isSearchable,
  ...rest
}: BaseSelectProps<ValueType>) => {
  const [selectIsFocused, setSelectIsFocused] = useState(false);
  const [menuInputIsFocused, setMenuInputIsFocused] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const options = useMemo(() => {
    if (!addNilOption) {
      return optionsOriginal;
    }
    // If all options have a count of 0 and there is a nil option, move it to the beginning.
    if (optionsOriginal.every((option) => option.count === 0)) {
      return [NIL_FILTER_OPTION, ...optionsOriginal] as OptionType<ValueType>[];
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
      menu: (styles, styleProps) => ({
        ...styles,
        ...(rest.styles &&
          rest.styles.menu &&
          rest.styles.menu(styles, styleProps)),
        width: 'fit-content',
        maxWidth: 270,
      }),
      multiValue: (styles, styleProps) => ({
        ...styles,
        ...(rest.styles &&
          rest.styles.multiValue &&
          rest.styles.multiValue(styles, styleProps)),
        background:
          'var(--cogs-surface--status-neutral--muted--default) !important',
        color: 'var(--cogs-text-icon--status-neutral)',
        borderRadius: 4,
      }),
      multiValueLabel: (styles, styleProps) => ({
        ...styles,
        ...(rest.styles &&
          rest.styles.multiValueLabel &&
          rest.styles.multiValueLabel(styles, styleProps)),
        color: 'var(--cogs-text-icon--status-neutral)',
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
        backgroundColor: 'none',
        color: 'var(--cogs-text-icon--medium)',
        fontWeight: 500,
        padding: 8,
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

  useEffect(() => {
    setMenuIsOpen(selectIsFocused || menuInputIsFocused);
  }, [menuInputIsFocused, selectIsFocused]);

  return (
    <Tooltip interactive disabled={!isError} content="No data found">
      <CogsSelectWrapper
        isError={isError}
        onFocus={() => setSelectIsFocused(true)}
        onBlur={() => setSelectIsFocused(false)}
      >
        <CogsSelect
          {...props}
          components={{
            Option,
            MultiValue,
            MenuList,
          }}
          disabled={isError || isLoading}
          isSearchable={false}
          showMenuInput={isSearchable}
          menuIsOpen={menuIsOpen}
          onMenuOpen={() => setSelectIsFocused(true)}
          onMenuClose={() => setSelectIsFocused(false)}
          onMenuInputFocus={() => setMenuInputIsFocused(true)}
          onMenuInputBlur={() => setMenuInputIsFocused(false)}
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
