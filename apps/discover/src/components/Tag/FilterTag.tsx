import * as React from 'react';

import { Tag } from '@cognite/cogs.js';

export interface FilterTagProps {
  tag: string;
  onClick: () => void;
}
export const FilterTag: React.FC<FilterTagProps> = ({ tag, onClick }) => {
  return (
    <Tag closable onClick={onClick} data-testid="filter-tag">
      {tag}
    </Tag>
  );
};
