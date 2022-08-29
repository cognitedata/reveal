import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';

import React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { NdsRiskTypesFilter } from '../../common/Events/NdsRiskTypesFilter';
import { ChartColumn } from '../types';

import { DropDownIconStyler } from './elements';
import { FilterItem } from './FilterItem';

export interface NdsFilterProps {
  options: MultiSelectCategorizedOptionMap;
  onChange: (events: NdsRiskTypesSelection) => void;
  onFiterVisiblityChange: (column: ChartColumn, visibility: boolean) => void;
}

export const NdsFilterItem: React.FC<WithDragHandleProps<NdsFilterProps>> =
  React.memo(
    ({ options, onChange, onFiterVisiblityChange, ...dragHandleProps }) => {
      return (
        <FilterItem
          column={ChartColumn.NDS}
          onFiterVisiblityChange={onFiterVisiblityChange}
          {...dragHandleProps}
        >
          <DropDownIconStyler>
            <NdsRiskTypesFilter
              options={options}
              onChange={onChange}
              iconInsteadText="Configure"
            />
          </DropDownIconStyler>
        </FilterItem>
      );
    }
  );
