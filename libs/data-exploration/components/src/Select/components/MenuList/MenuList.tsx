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
      <components.MenuList {...props}>{children}</components.MenuList>
    </>
  );
};
