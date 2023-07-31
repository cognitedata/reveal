import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import { useCallback } from 'react';
import * as React from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { DragDropContainer } from 'components/DragDropContainer';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';

import { useFilterOptions } from '../hooks/useFilterOptions';
import { ChartColumn } from '../types';
import { DEFAULT_COLUMN_ORDER } from '../WellboreStickChart/constants';

import { DepthFilterItem } from './components/DepthFilterItem';
import { FilterItem } from './components/FilterItem';
import { MeasurementsFilterItem } from './components/MeasurementsFilterItem';
import { NdsFilterItem } from './components/NdsFilterItem';
import { NptFilterItem } from './components/NptFilterItem';
import { SummaryFilterItem } from './components/SummaryFilterItem';
import { FilterBarWrapper } from './elements';

interface FilterBarProps {
  columnOrder: ChartColumn[];
  depthMeasurementType: DepthMeasurementUnit;
  isUnifiedScale: boolean;
  pressureUnit: PressureUnit;
  onPressureUnitChange: (unit: PressureUnit) => void;
  onChangeDepthMeasurementType: (
    depthMeasurementType: DepthMeasurementUnit
  ) => void;
  onToggleUnifyScale: (isUnifiedScale: boolean) => void;
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
    isUnifiedScale,
    pressureUnit,
    onPressureUnitChange,
    onChangeDepthMeasurementType,
    onToggleUnifyScale,
    onNptCodesChange,
    onNdsCodesChange,
    onSummaryVisibilityChange,
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

    const filters: Record<ChartColumn, JSX.Element> = {
      [ChartColumn.FORMATION]: (
        <FilterItem
          key={ChartColumn.FORMATION}
          column={ChartColumn.FORMATION}
          onFiterVisiblityChange={onColumnVisibilityChange}
        />
      ),
      [ChartColumn.DEPTH]: (
        <DepthFilterItem
          key={ChartColumn.DEPTH}
          depthMeasurementType={depthMeasurementType}
          isUnifiedScale={isUnifiedScale}
          onChangeDepthMeasurementType={onChangeDepthMeasurementType}
          onToggleUnifyScale={onToggleUnifyScale}
        />
      ),
      [ChartColumn.CASINGS]: (
        <FilterItem
          key={ChartColumn.CASINGS}
          column={ChartColumn.CASINGS}
          onFiterVisiblityChange={onColumnVisibilityChange}
        />
      ),
      [ChartColumn.MEASUREMENTS]: (
        <MeasurementsFilterItem
          key={ChartColumn.MEASUREMENTS}
          pressureUnit={pressureUnit}
          onChange={onMeasurementTypesChange}
          onFiterVisiblityChange={onColumnVisibilityChange}
          onPressureUnitChange={onPressureUnitChange}
        />
      ),
      [ChartColumn.TRAJECTORY]: (
        <FilterItem
          key={ChartColumn.TRAJECTORY}
          column={ChartColumn.TRAJECTORY}
          onFiterVisiblityChange={onColumnVisibilityChange}
        />
      ),
      [ChartColumn.NDS]: (
        <NdsFilterItem
          key={ChartColumn.NDS}
          options={ndsFilterOptions}
          onChange={onNdsCodesChange}
          onFiterVisiblityChange={onColumnVisibilityChange}
        />
      ),
      [ChartColumn.NPT]: (
        <NptFilterItem
          key={ChartColumn.NPT}
          options={nptFilterOptions}
          onChange={onNptCodesChange}
          onFiterVisiblityChange={onColumnVisibilityChange}
        />
      ),
      [ChartColumn.SUMMARY]: (
        <SummaryFilterItem
          key={ChartColumn.SUMMARY}
          onChange={onSummaryVisibilityChange}
          onFiterVisiblityChange={onColumnVisibilityChange}
        />
      ),
    };

    return (
      <FilterBarWrapper>
        <DragDropContainer
          id="stick-chart-filter-content"
          elementsOrder={columnOrder}
          onRearranged={handleRearrange}
        >
          {DEFAULT_COLUMN_ORDER.map((column) => {
            return filters[column];
          })}
        </DragDropContainer>
      </FilterBarWrapper>
    );
  }
);
