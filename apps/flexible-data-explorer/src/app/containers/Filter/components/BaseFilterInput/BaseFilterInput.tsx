import styled from 'styled-components/macro';

import { SuggestionsDropdown } from '../SuggestionsDropdown';

import { InputMulti, InputSingle } from './components';
import {
  BaseFilterInputBaseProps,
  BaseFilterInputSuggestionsProps,
} from './types';
import { transformValue } from './utils';

export interface BaseFilterInputSingleProps<T extends string | number | Date>
  extends BaseFilterInputBaseProps,
    BaseFilterInputSuggestionsProps {
  value?: T;
  onChange?: (value?: T) => void;
}

const BaseFilterInputSingle = <T extends string | number | Date>({
  showSuggestions,
  suggestions,
  onChange,
  ...rest
}: BaseFilterInputSingleProps<T>) => {
  const handleSelectSuggestion = (suggestion: string) => {
    const transformedValue = transformValue<T>(suggestion);
    onChange?.(transformedValue);
  };

  return (
    <Container>
      <SuggestionsDropdown
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      >
        <InputSingle onChange={onChange} {...rest} />
      </SuggestionsDropdown>
    </Container>
  );
};

export interface BaseFilterInputMultiProps<T extends string | number>
  extends BaseFilterInputBaseProps,
    BaseFilterInputSuggestionsProps {
  value?: T[];
  onChange?: (value?: T[]) => void;
}

const BaseFilterInputMulti = <T extends string | number>({
  showSuggestions,
  suggestions,
  value = [],
  onChange,
  ...rest
}: BaseFilterInputMultiProps<T>) => {
  const handleSelectSuggestion = (suggestion: string) => {
    const transformedValue = transformValue<T>(suggestion);
    const newValue = transformedValue ? [...value, transformedValue] : value;
    onChange?.(newValue);
  };

  return (
    <Container>
      <SuggestionsDropdown
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      >
        <InputMulti onChange={onChange} {...rest} />
      </SuggestionsDropdown>
    </Container>
  );
};

export const BaseFilterInput = {
  Single: BaseFilterInputSingle,
  Multi: BaseFilterInputMulti,
};

const Container = styled.div`
  position: relative;

  input,
  .input-wrapper {
    width: 100%;
  }

  .error-space {
    margin-left: 2px;
    font-size: 12px;
  }
`;
