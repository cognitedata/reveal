import React from 'react';

import { BlueFilterTagWrapper } from './elements';

export interface FilterTagProps {
  tag: string;
  onClick: () => void;
}
export const BlueFilterTag: React.FC<FilterTagProps> = ({ tag, onClick }) => {
  return (
    <BlueFilterTagWrapper closable onClick={onClick} data-testid="filter-tag">
      {tag}
    </BlueFilterTagWrapper>
  );
};
