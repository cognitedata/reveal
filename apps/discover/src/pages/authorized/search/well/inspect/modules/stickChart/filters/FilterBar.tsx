import { useCallback } from 'react';

import { DragDropContainer } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { ChartColumn } from '../types';

import { FilterBarWrapper } from './elements';
import { FilterItem } from './FilterItem';
import { NdsFilterItem } from './NdsFilterItem';
import { NptFilterItem } from './NptFilterItem';

interface FilterBarProps {
  visibleColumns: ChartColumn[];
  onNptCodesChange: (events: MultiSelectCategorizedOptionMap) => void;
  onNdsCodesChange: (eventCodes: MultiSelectCategorizedOptionMap) => void;
  onRearrange: (order: ChartColumn[]) => void;
  onVisibleColumnChange: (visibleColumns: ChartColumn[]) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  visibleColumns,
  onNptCodesChange,
  onNdsCodesChange,
  onRearrange,
  onVisibleColumnChange,
}) => {
  const handleColumnVisibilityChange = useCallback(
    (columnIdentifier: ChartColumn, isVisible: boolean) => {
      const columns = isVisible
        ? [...visibleColumns, columnIdentifier]
        : visibleColumns.filter((column) => column !== columnIdentifier);

      onVisibleColumnChange(columns);
    },
    [onVisibleColumnChange]
  );

  const handleRearrange = useCallback(
    (columnKeysOrder: string[]) => {
      onRearrange(columnKeysOrder as ChartColumn[]);
    },
    [onRearrange]
  );

  return (
    <FilterBarWrapper>
      <DragDropContainer
        id="casing-filter-content"
        onRearranged={handleRearrange}
      >
        <FilterItem
          key={ChartColumn.FORMATION}
          column={ChartColumn.FORMATION}
          onFiterVisiblityChange={handleColumnVisibilityChange}
        />
        <FilterItem
          key={ChartColumn.CASINGS}
          column={ChartColumn.CASINGS}
          onFiterVisiblityChange={handleColumnVisibilityChange}
        />
        <NptFilterItem
          key={ChartColumn.NPT}
          onFiterVisiblityChange={handleColumnVisibilityChange}
          onNptCodesChange={onNptCodesChange}
        />
        <NdsFilterItem
          key={ChartColumn.NDS}
          onFiterVisiblityChange={handleColumnVisibilityChange}
          onNdsCodesChange={onNdsCodesChange}
        />
        <FilterItem
          key={ChartColumn.SUMMARY}
          column={ChartColumn.SUMMARY}
          onFiterVisiblityChange={handleColumnVisibilityChange}
        />
      </DragDropContainer>
    </FilterBarWrapper>
  );
};
