import * as React from 'react';
import { InputActionMeta } from 'react-select';

import { Input, InputProps } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { InputWrapper } from './elements';

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (newValue: string, actionMeta: InputActionMeta) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation();
  const inputElement = React.useRef<HTMLInputElement>(null);

  // this is used to focus the input default. autoFocus not functioning here
  React.useEffect(() => {
    inputElement.current?.focus();
  }, []);

  return (
    <InputWrapper>
      <Input
        {...rest}
        variant="noBorder"
        placeholder={t('FILTER_BY_NAME', 'Filter by name')}
        value={value}
        onChange={(event) =>
          onChange(event.target.value, {
            action: 'input-change',
          })
        }
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onTouchEnd={(event) => {
          event.stopPropagation();
        }}
        ref={inputElement}
      />
    </InputWrapper>
  );
};
