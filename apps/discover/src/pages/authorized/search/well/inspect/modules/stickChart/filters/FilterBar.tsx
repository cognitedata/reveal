import { useState } from 'react';

import { DragDropContainer } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { COLUMNS } from '../WellboreCasingView/constants';

import { FilterBarWrapper } from './elements';
import { FilterItem } from './FilterItem';
import { NdsFilterItem } from './NdsFilterItem';
import { NptFilterItem } from './NptFilterItem';

interface FilterBarProps {
  onNptCodesChange: (events: MultiSelectCategorizedOptionMap) => void;
  onNdsCodesChange: (eventCodes: MultiSelectCategorizedOptionMap) => void;
  onRearrange: (order: string[]) => void;
  onVisibleColumnChange: (visibleColumns: string[]) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onNptCodesChange,
  onNdsCodesChange,
  onRearrange,
  onVisibleColumnChange,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<Array<string>>([
    COLUMNS.CASINGS,
    COLUMNS.NDS,
    COLUMNS.NPT,
  ]);

  const handleColumnVisibilityChange = (
    columnIdentifier: string,
    isVisible: boolean
  ) => {
    const columns = isVisible
      ? [...visibleColumns, columnIdentifier]
      : visibleColumns.filter((column) => column !== columnIdentifier);

    setVisibleColumns(columns);
    onVisibleColumnChange(columns);
  };

  return (
    <FilterBarWrapper>
      <DragDropContainer id="casing-filter-content" onRearranged={onRearrange}>
        {/* <FilterItem text="Formations" key="formations" /> */}
        <FilterItem
          text="Casings"
          column={COLUMNS.CASINGS}
          key={COLUMNS.CASINGS}
          onFiterVisiblityChange={handleColumnVisibilityChange}
        />
        <NptFilterItem
          onFiterVisiblityChange={handleColumnVisibilityChange}
          onNptCodesChange={onNptCodesChange}
        />
        <NdsFilterItem
          onFiterVisiblityChange={handleColumnVisibilityChange}
          onNdsCodesChange={onNdsCodesChange}
        />
        <FilterItem
          text="Section Summary"
          column={COLUMNS.SUMMARY}
          key={COLUMNS.SUMMARY}
          onFiterVisiblityChange={handleColumnVisibilityChange}
        />
      </DragDropContainer>
    </FilterBarWrapper>
  );
};
