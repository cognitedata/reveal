import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { NptCodesFilter } from '../../common/Events/NptCodesFilter';
import { ChartColumn } from '../types';

import { DropDownIconStyler } from './elements';
import { FilterItem } from './FilterItem';

export interface NptFilterProps {
  options: MultiSelectCategorizedOptionMap;
  onChange: (events: NptCodesSelection) => void;
  onFiterVisiblityChange: (column: ChartColumn, visibility: boolean) => void;
}

export const NptFilterItem: React.FC<WithDragHandleProps<NptFilterProps>> = ({
  options,
  onChange,
  onFiterVisiblityChange,
  ...dragHandleProps
}) => {
  return (
    <FilterItem
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
};
