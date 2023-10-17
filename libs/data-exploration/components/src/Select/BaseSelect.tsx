import { ReactNode, useEffect, useMemo, useState } from 'react';
import { InputActionMeta, NamedProps } from 'react-select';

import styled from 'styled-components';

import {
  OptionType,
  Select as CogsSelect,
  SelectProps as CogsSelectProps,
  Theme,
  Tooltip,
} from '@cognite/cogs.js';

import {
  NIL_FILTER_VALUE,
  NOT_SET,
  useTranslation,
} from '@data-exploration-lib/core';

import { Option, MultiValue, MenuList } from './components';

export const NOT_SET_OPTION: OptionType<string> = {
  label: NOT_SET,
  value: NIL_FILTER_VALUE,
};
export interface BaseSelectProps<ValueType>
  extends CogsSelectProps<ValueType>,
    Pick<NamedProps, 'styles' | 'onInputChange' | 'isLoading'> {
  creatable?: boolean;
  cogsTheme?: Theme;
  addNilOption?: boolean;
  isError?: boolean;
  menuListFooter?: ReactNode;
  renderHeader?: () => React.ReactNode;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
}

export const BaseSelect = <ValueType,>({
  cogsTheme,
  addNilOption = false,
  options: optionsOriginal,
  isError = false,
  isLoading,
  isSearchable,
  placeholder,
  menuListFooter = <></>,
  menuIsOpen: menuIsOpenProp,
  ...rest
}: BaseSelectProps<ValueType>) => {
  const { t } = useTranslation();

  const [selectIsFocused, setSelectIsFocused] = useState(false);
  const [menuInputIsFocused, setMenuInputIsFocused] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(menuIsOpenProp ?? false);

  const options = useMemo(() => {
    if (!addNilOption) {
      return optionsOriginal;
    }
    return [NOT_SET_OPTION, ...optionsOriginal] as OptionType<ValueType>[];
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
    setMenuIsOpen(menuIsOpenProp ?? (selectIsFocused || menuInputIsFocused));
  }, [menuInputIsFocused, menuIsOpenProp, selectIsFocused]);

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={t('NO_DATA_FOUND', 'No data found')}
    >
      <CogsSelectWrapper
        isError={isError}
        onFocus={() => setSelectIsFocused(true)}
        onBlur={() => setSelectIsFocused(false)}
        data-testid={`${rest['data-testid']}`}
      >
        <CogsSelect
          {...props}
          components={{
            Option,
            MultiValue,
            MenuList,
          }}
          disabled={isError || isLoading}
          placeholder={placeholder || t('SELECT_PLACEHOLDER', 'Select...')}
          noOptionsMessage={() => t('NO_OPTIONS', 'No options')}
          isSearchable={false}
          showMenuInput={isSearchable}
          menuIsOpen={menuIsOpen}
          onMenuOpen={() => setSelectIsFocused(true)}
          onMenuClose={() => setSelectIsFocused(false)}
          onMenuInputFocus={() => setMenuInputIsFocused(true)}
          onMenuInputBlur={() => setMenuInputIsFocused(false)}
          addNilOption={addNilOption}
          menuListFooter={menuListFooter}
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
