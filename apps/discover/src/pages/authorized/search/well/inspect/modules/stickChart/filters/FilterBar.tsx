import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import { useCallback } from 'react';
import * as React from 'react';

import { DragDropContainer } from 'components/DragDropContainer';

import { useFilterOptions } from '../hooks/useFilterOptions';
import { ChartColumn } from '../types';

import { FilterBarWrapper } from './elements';
import { FilterItem } from './FilterItem';
import { NdsFilterItem } from './NdsFilterItem';
import { NptFilterItem } from './NptFilterItem';

interface FilterBarProps {
  onNptCodesChange: (selection: NptCodesSelection) => void;
  onNdsCodesChange: (selection: NdsRiskTypesSelection) => void;
  onRearrange: (order: ChartColumn[]) => void;
  onColumnVisibilityChange: (column: ChartColumn, isVisible: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = React.memo(
  ({
    onNptCodesChange,
    onNdsCodesChange,
    onRearrange,
    onColumnVisibilityChange,
  }) => {
    const { nptFilterOptions, ndsFilterOptions } = useFilterOptions();

    const handleRearrange = useCallback(
      (columnOrder: string[]) => {
        onRearrange(columnOrder as ChartColumn[]);
      },
      [onRearrange]
    );

    return (
      <FilterBarWrapper>
        <DragDropContainer
          id="stick-chart-filter-content"
          onRearranged={handleRearrange}
        >
          <FilterItem
            key={ChartColumn.FORMATION}
            column={ChartColumn.FORMATION}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <FilterItem
            key={ChartColumn.CASINGS}
            column={ChartColumn.CASINGS}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <NptFilterItem
            key={ChartColumn.NPT}
            options={nptFilterOptions}
            onChange={onNptCodesChange}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <NdsFilterItem
            key={ChartColumn.NDS}
            options={ndsFilterOptions}
            onChange={onNdsCodesChange}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <FilterItem
            key={ChartColumn.SUMMARY}
            column={ChartColumn.SUMMARY}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <FilterItem key={ChartColumn.DEPTH} column={ChartColumn.DEPTH} />

          <FilterItem
            key={ChartColumn.TRAJECTORY}
            column={ChartColumn.TRAJECTORY}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <FilterItem
            key={ChartColumn.MEASUREMENTS}
            column={ChartColumn.MEASUREMENTS}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />
        </DragDropContainer>
      </FilterBarWrapper>
    );
  }
);
