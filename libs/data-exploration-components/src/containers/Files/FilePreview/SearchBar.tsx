import React from 'react';
import { Button, Input } from '@cognite/cogs.js';
import { useDisclosure } from '../../../hooks/index';

export const SearchBar = ({
  isOpen,
  value,
  onChange,
  onOpenPress,
  onClosePress,
}: {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpenPress: () => void;
  onClosePress: () => void;
}) => {
  if (isOpen) {
    return (
      <Input
        postfix={
          <Button
            icon="Close"
            type="ghost"
            aria-label="Close"
            onClick={onClosePress}
          />
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    );
  }

  return (
    <Button
      icon="Search"
      type="ghost"
      aria-label="Search"
      onClick={onOpenPress}
    />
  );
};
