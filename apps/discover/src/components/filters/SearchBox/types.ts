import { InputVariant } from '@cognite/cogs.js';

export interface SearchBoxProps {
  onSearch: (searchPhrase: string) => void;
  placeholder?: string;
  value?: string;
  variant?: InputVariant;
}
