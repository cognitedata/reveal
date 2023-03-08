import * as React from 'react';

import { FiltersWrapper } from './elements';
import { ToolbarProps } from './Toolbar';

export interface FiltersProps extends Pick<ToolbarProps, 'renderFilters'> {
  showFilters: boolean;
}

export const Filters: React.FC<FiltersProps> = ({
  renderFilters,
  showFilters,
}) => {
  if (!showFilters) {
    return null;
  }

  return (
    <FiltersWrapper>
      {renderFilters?.().map((Filter, index) => {
        return (
          <React.Fragment key={`filter-${index + 1}`}>{Filter}</React.Fragment>
        );
      })}
    </FiltersWrapper>
  );
};
