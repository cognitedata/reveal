import { Suggestion } from '@fdx/shared/types/filters';

import { Dropdown } from '@cognite/cogs.js';

import { SuggestionsMenu } from './SuggestionsMenu';

export interface SuggestionsDropdownProps {
  showSuggestions?: boolean;
  suggestions?: Suggestion[];
  onSelectSuggestion?: (suggestion: Suggestion) => void;
}

export const SuggestionsDropdown: React.FC<
  React.PropsWithChildren<SuggestionsDropdownProps>
> = ({ showSuggestions, suggestions, onSelectSuggestion, children }) => {
  return (
    <Dropdown
      appendTo="parent"
      hideOnSelect
      content={
        <SuggestionsMenu
          showSuggestions={showSuggestions}
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
        />
      }
    >
      <>{children}</>
    </Dropdown>
  );
};
