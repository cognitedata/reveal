import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { NptCodesFilter } from '../../../common/Events/NptCodesFilter';
import { ChartColumn } from '../../types';
import { DropDownIconStyler } from '../elements';

import { FilterItem } from './FilterItem';

export interface NptFilterProps {
  options: MultiSelectCategorizedOptionMap;
  onChange: (events: NptCodesSelection) => void;
  onFiterVisiblityChange: (column: ChartColumn, visibility: boolean) => void;
}

export const NptFilterItem: React.FC<WithDragHandleProps<NptFilterProps>> =
  React.memo(
    ({ options, onChange, onFiterVisiblityChange, ...dragHandleProps }) => {
      return (
        <FilterItem
          id="npt-filter"
          column={ChartColumn.NPT}
          onFiterVisiblityChange={onFiterVisiblityChange}
          {...dragHandleProps}
        >
          <DropDownIconStyler>
            <NptCodesFilter
              options={options}
              onChange={onChange}
              iconInsteadText="Configure"
            />
          </DropDownIconStyler>
        </FilterItem>
      );
    }
  );
