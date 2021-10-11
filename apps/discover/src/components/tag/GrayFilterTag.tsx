import React from 'react';

import { GrayFilterTagWrapper } from './elements';

export interface FilterTagProps {
  tag: string;
  onClick: () => void;
}
export const GrayFilterTag: React.FC<FilterTagProps> = ({ tag, onClick }) => {
  return (
    <GrayFilterTagWrapper closable onClick={onClick} data-testid="filter-tag">
      {tag}
    </GrayFilterTagWrapper>
  );
};
