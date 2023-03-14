import { Button, Input, ToolBar, Tooltip } from '@cognite/cogs.js';
import { UseCurrentSearchResultState } from './hooks/useCurrentSearchResult';
import { UseSearchBarState } from './hooks/useSearchBarState';

export type SearchBarProps = {
  isOpen: boolean;
  value: string;
  numberOfSearchResults: number;
  onChange: (value: string) => void;
} & UseCurrentSearchResultState &
  Pick<
    UseSearchBarState,
    'onSearchOpen' | 'onSearchClose' | 'setSearchBarInputRef'
  >;

export const SearchBar = ({
  isOpen,
  value,
  onChange,
  onSearchOpen,
  onSearchClose,
  setSearchBarInputRef,
  currentSearchResultIndex,
  numberOfSearchResults,
  onNextResult,
  onPreviousResult,
}: SearchBarProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onSearchClose();
      return;
    }

    if (event.key === 'Enter') {
      if (event.shiftKey) {
        onPreviousResult();
        return;
      }
      onNextResult();
    }

    // We don't want the browser's find-in-page to open when the user presses cmd/ctrl+f when the search bar is in focus
    if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSearchOpen(); // This selects all the text in the input field
    }
  };

  const NextPrevActions = [
    {
      icon: 'ArrowUp',
      onClick: onPreviousResult,
      description: 'Previous search result',
      'aria-label': 'Previous search result',
    },
    {
      icon: 'ArrowDown',
      onClick: onNextResult,
      description: 'Next search result',
      'aria-label': 'Next search result',
    },
  ];

  if (isOpen) {
    return (
      <ToolBar direction="horizontal" style={{ gap: '4px' }}>
        <>
          <Input
            ref={setSearchBarInputRef}
            iconPlacement="left"
            icon="Search"
            placeholder="Find in document..."
            postfix={`${currentSearchResultIndex}/${numberOfSearchResults}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            // clearable={{ callback: () => onChange('') }} // TODO: Add this when the styling is fixed (currently it will be placed in the middle of the input field)
            autoFocus
          />
          <ToolBar.ButtonGroup buttonGroup={NextPrevActions} />
        </>
        <Button
          icon="Close"
          type="ghost"
          aria-label="Close"
          onClick={onSearchClose}
        />
      </ToolBar>
    );
  }

  return (
    <ToolBar>
      <Tooltip content="Find in document">
        <Button
          icon="Search"
          aria-label="Find in document"
          type="ghost"
          onClick={onSearchOpen}
        />
      </Tooltip>
    </ToolBar>
  );
};
