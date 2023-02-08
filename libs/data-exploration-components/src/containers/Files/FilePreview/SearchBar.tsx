import React from 'react';
import { Button, Input } from '@cognite/cogs.js';
import { useDisclosure } from '../../../hooks/index';

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (page: string) => void;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure({
    isOpen: Boolean(searchQuery),
  });

  const handleCloseSearch = () => {
    onClose();
    setSearchQuery('');
  };

  return isOpen ? (
    <Input
      postfix={
        <Button
          icon="Close"
          type="ghost"
          aria-label="Close"
          onClick={handleCloseSearch}
        />
      }
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      autoFocus
    />
  ) : (
    <Button icon="Search" type="ghost" aria-label="Search" onClick={onOpen} />
  );
};
