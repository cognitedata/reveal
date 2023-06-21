import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export const ExplorationSearchBar = (props: {
  searchString?: string;
  onChange: (text: string) => void;
}) => {
  const [text, setText] = useState(props.searchString || '');
  const [searchValue] = useDebounce(text, 400);

  useEffect(() => {
    props.onChange(searchValue);
  }, [searchValue]);

  return (
    <Input
      size="large"
      // variant="noBorder"
      // fullWidth
      // icon="Search"
      placeholder="Search..."
      onChange={(e) => setText(e.target.value)}
      value={text}
      // clearable={{ callback: () => setText(''), labelText: 'clear' }}
    />
  );
};
