import * as React from 'react';
import {
  components,
  MenuListComponentProps,
  OptionTypeBase,
  InputActionMeta,
} from 'react-select';

import noop from 'lodash/noop';

import { isEscapeButton } from '@data-exploration-lib/core';

import { SearchInput } from '../SearchInput';

import { MenuListContent, MenuListWrapper } from './elements';

export const MenuList = <OptionType extends OptionTypeBase>({
  children,
  ...props
}: // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
MenuListComponentProps<OptionType>) => {
  const {
    showMenuInput,
    inputValue,
    onInputChange = noop,
    onMenuInputFocus,
    onMenuInputBlur,
  } = props.selectProps;

  // reducing the height of the search input if it's enabled
  const maxHeight = showMenuInput ? props.maxHeight - 45 : props.maxHeight;

  const [filterInput, setFilterInput] = React.useState<{
    input: string;
    action?: InputActionMeta;
  }>({ input: '', action: { action: 'input-change' } });

  React.useEffect(() => {
    if (inputValue !== filterInput.input) {
      onInputChange(filterInput.input, filterInput.action);
    }
  }, [inputValue, filterInput, onInputChange]);

  const onChangeHandler = (newValue: string, action: InputActionMeta) => {
    setFilterInput({ input: newValue, action });
  };

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEscapeButton(event.key)) {
      onMenuInputBlur();
    }
  };

  const selectDataTestId = props.selectProps['data-testid'];

  return (
    <MenuListWrapper>
      <MenuListContent data-testid={`${selectDataTestId}-menu-list`}>
        {showMenuInput && (
          <SearchInput
            data-testid={`${selectDataTestId}-search-input`}
            value={filterInput.input}
            onChange={onChangeHandler}
            onFocus={onMenuInputFocus}
            onBlur={onMenuInputBlur}
            onKeyDown={onKeyDownHandler}
          />
        )}

        <components.MenuList {...props} maxHeight={maxHeight}>
          {children}
        </components.MenuList>
      </MenuListContent>
    </MenuListWrapper>
  );
};
