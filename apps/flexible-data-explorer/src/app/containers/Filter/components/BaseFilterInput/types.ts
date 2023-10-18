import { Suggestion } from '../../types';

export type BaseFilterInputType = 'text' | 'number' | 'date';

export interface BaseFilterInputBaseProps {
  type?: BaseFilterInputType;
  placeholder?: string;
  helpText?: string;
  isLoading?: boolean;
  onInputChange?: (inputValue: string) => void;
}

export interface BaseFilterInputSuggestionsProps {
  showSuggestions?: boolean;
  suggestions?: Suggestion[];
}
