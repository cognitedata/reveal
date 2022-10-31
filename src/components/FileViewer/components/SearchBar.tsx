import { Button, Input } from '@cognite/cogs.js';
import { useState } from 'react';

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (page: string) => void;
}) => {
  const [expandSearch, setExpandSearch] = useState<boolean>(false);

  const handleCloseSearch = () => {
    setExpandSearch(false);
    setSearchQuery('');
  };

  return expandSearch ? (
    <Input
      postfix={
        <Button icon="Close" aria-label="Close" onClick={handleCloseSearch} />
      }
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      autoFocus
    />
  ) : (
    <Button icon="Search" onClick={() => setExpandSearch(true)} />
  );
};
