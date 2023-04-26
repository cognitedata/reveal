import {
  components,
  MenuListComponentProps,
  OptionTypeBase,
} from 'react-select';

import noop from 'lodash/noop';

import { SearchInput } from '../SearchInput';

export const MenuList = <OptionType extends OptionTypeBase>({
  children,
  ...props
}: MenuListComponentProps<OptionType>) => {
  const {
    showMenuInput,
    inputValue,
    onInputChange = noop,
    onMenuInputFocus,
    onMenuInputBlur,
  } = props.selectProps;

  // reducing the height of the search input if it's enabled
  const maxHeight = showMenuInput ? props.maxHeight - 45 : props.maxHeight;

  return (
    <>
      {showMenuInput && (
        <SearchInput
          value={inputValue}
          onChange={onInputChange}
          onFocus={onMenuInputFocus}
          onBlur={onMenuInputBlur}
        />
      )}
      <components.MenuList {...props} maxHeight={maxHeight}>
        {children}
      </components.MenuList>
    </>
  );
};
