import * as React from 'react';
import {
  components,
  MenuListComponentProps,
  OptionTypeBase,
  InputActionMeta,
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

  return (
    <>
      {showMenuInput && (
        <SearchInput
          value={filterInput.input}
          onChange={onChangeHandler}
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
