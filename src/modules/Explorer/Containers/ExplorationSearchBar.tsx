import React, { useEffect, useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { useDebounce } from 'use-debounce';

export const ExplorationSearchBar = (props: {
  onChange: (text: string) => void;
}) => {
  const [text, setText] = useState('');
  const [searchValue] = useDebounce(text, 400);

  useEffect(() => {
    props.onChange(searchValue);
  }, [searchValue]);

  return (
    <Input
      size="large"
      variant="noBorder"
      fullWidth
      style={{
        background: 'transparent',
      }}
      icon="Search"
      placeholder="Search..."
      onChange={(e) => setText(e.target.value)}
      value={text}
      clearable={{ callback: () => setText(''), labelText: 'clear' }}
    />
  );
};
