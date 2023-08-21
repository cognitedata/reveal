import { ChangeEvent, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components/macro';

import {
  Input as CogsInput,
  BaseInputProps as CogsBaseInputProps,
  IconType,
} from '@cognite/cogs.js';

import { formatDate, isDate } from '../../../../utils/date';
import { Suggestion } from '../../types';
import { SuggestionsDropdown } from '../SuggestionsDropdown';

export interface BaseFilterInputProps<T extends string | number | Date>
  extends Omit<CogsBaseInputProps, 'onChange' | 'value'> {
  value?: T;
  showSuggestions?: boolean;
  suggestions?: Suggestion[];
  isLoading?: boolean;
  onChange?: (value?: T) => void;
}

export const BaseFilterInput = <T extends string | number | Date>({
  showSuggestions,
  suggestions,
  isLoading,
  type,
  value,
  onChange,
  icon,
  iconPlacement,
  ...rest
}: BaseFilterInputProps<T>) => {
  const [isInputFocused, setInputFocused] = useState(false);

  const inputIcon: IconType = useMemo(() => {
    if (isLoading) {
      return 'Loader';
    }
    return icon;
  }, [icon, isLoading]);

  const inputIconPlacement = useMemo(() => {
    if (isLoading) {
      return 'right';
    }
    return iconPlacement;
  }, [iconPlacement, isLoading]);

  const convertedValue = useMemo(() => {
    if (type === 'datetime-local') {
      if (isDate(value)) {
        return formatDate(value, 'YYYY-MM-DDTHH:mm');
      }
      return undefined;
    }
    return value as string | number | undefined;
  }, [type, value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (isEmpty(inputValue)) {
      onChange?.(undefined);
      return;
    }

    if (type === 'number') {
      onChange?.(Number(inputValue) as T);
      return;
    }

    if (type === 'datetime-local') {
      onChange?.(new Date(inputValue) as T);
      return;
    }

    onChange?.(inputValue as T);
  };

  return (
    <Container>
      <SuggestionsDropdown
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        onSelectSuggestion={(suggestion) => onChange?.(suggestion as T)}
      >
        <CogsInput
          {...rest}
          type={type}
          value={convertedValue}
          onChange={handleChange}
          icon={inputIcon}
          iconPlacement={inputIconPlacement}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          autoFocus={isInputFocused}
        />
      </SuggestionsDropdown>
    </Container>
  );
};

const Container = styled.div`
  input,
  .input-wrapper {
    width: 100%;
  }

  .error-space {
    margin-left: 2px;
    font-size: 12px;
  }
`;
