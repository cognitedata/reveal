import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import { useCallback } from 'react';
import * as React from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { DragDropContainer } from 'components/DragDropContainer';
import { DepthMeasurementUnit } from 'constants/units';

import { useFilterOptions } from '../hooks/useFilterOptions';
import { ChartColumn } from '../types';

import { DepthFilterItem } from './DepthFilterItem';
import { FilterBarWrapper } from './elements';
import { FilterItem } from './FilterItem';
import { MeasurementsFilterItem } from './MeasurementsFilterItem';
import { NdsFilterItem } from './NdsFilterItem';
import { NptFilterItem } from './NptFilterItem';
// import { SummaryFilterItem } from './SummaryFilterItem';

interface FilterBarProps {
  columnOrder: ChartColumn[];
  depthMeasurementType: DepthMeasurementUnit;
  onChangeDepthMeasurementType: (
    depthMeasurementType: DepthMeasurementUnit
  ) => void;
  onNptCodesChange: (selection: NptCodesSelection) => void;
  onNdsCodesChange: (selection: NdsRiskTypesSelection) => void;
  onSummaryVisibilityChange: (selection: BooleanMap) => void;
  onMeasurementTypesChange: (selection: BooleanMap) => void;
  onRearrange: (order: ChartColumn[]) => void;
  onColumnVisibilityChange: (column: ChartColumn, isVisible: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = React.memo(
  ({
    columnOrder,
    depthMeasurementType,
    onChangeDepthMeasurementType,
    onNptCodesChange,
    onNdsCodesChange,
    // onSummaryVisibilityChange,
    onMeasurementTypesChange,
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
          elementsOrder={columnOrder}
          onRearranged={handleRearrange}
        >
          <FilterItem
            key={ChartColumn.FORMATION}
            column={ChartColumn.FORMATION}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <DepthFilterItem
            key={ChartColumn.DEPTH}
            depthMeasurementType={depthMeasurementType}
            onChange={onChangeDepthMeasurementType}
          />

          <FilterItem
            key={ChartColumn.CASINGS}
            column={ChartColumn.CASINGS}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <MeasurementsFilterItem
            key={ChartColumn.MEASUREMENTS}
            onChange={onMeasurementTypesChange}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <NdsFilterItem
            key={ChartColumn.NDS}
            options={ndsFilterOptions}
            onChange={onNdsCodesChange}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          <NptFilterItem
            key={ChartColumn.NPT}
            options={nptFilterOptions}
            onChange={onNptCodesChange}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />

          {/* <SummaryFilterItem
            key={ChartColumn.SUMMARY}
            onChange={onSummaryVisibilityChange}
            onFiterVisiblityChange={onColumnVisibilityChange}
          /> */}

          <FilterItem
            key={ChartColumn.TRAJECTORY}
            column={ChartColumn.TRAJECTORY}
            onFiterVisiblityChange={onColumnVisibilityChange}
          />
        </DragDropContainer>
      </FilterBarWrapper>
    );
  }
);
