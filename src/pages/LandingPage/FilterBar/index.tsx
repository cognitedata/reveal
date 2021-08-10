import React from 'react';
import { Input } from '@cognite/cogs.js';
import { Flex } from 'components/Common';

interface FilterBarProps {
  query: string;
  setQuery: (val: string) => void;
}
export default function FilterBar({ query, setQuery }: FilterBarProps) {
  return (
    <Flex row>
      <Input
        placeholder="Filter by name..."
        onChange={(e) => setQuery(e.currentTarget.value)}
        value={query}
        style={{ marginRight: '10px' }}
      />
    </Flex>
  );
}
