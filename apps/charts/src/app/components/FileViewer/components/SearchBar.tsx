import { useState } from 'react';

import { Button, Input } from '@cognite/cogs.js';

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (page: string) => void;
}) => {
  const [expandSearch, setExpandSearch] = useState<boolean>(
    Boolean(searchQuery)
  );

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
