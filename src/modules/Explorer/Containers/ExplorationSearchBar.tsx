import React from 'react';
import { Input } from '@cognite/cogs.js';

export const ExplorationSearchBar = () => {
  // TODO: add the nesscarry states: https://github.com/cognitedata/data-exploration/blob/master/src/app/containers/Exploration/ExplorationSearchBar.tsx

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
      onChange={() => {}}
      value=""
    />
  );
};
