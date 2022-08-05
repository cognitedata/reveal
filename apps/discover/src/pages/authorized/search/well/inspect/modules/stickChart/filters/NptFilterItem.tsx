import { useState } from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { EventNptFilter } from '../../measurements/filters/EventNptFilter';
import { ChartColumn } from '../types';

import { DropDownIconStyler } from './elements';
import { FilterItem } from './FilterItem';

export interface NptFilterProps {
  onNptCodesChange: (events: MultiSelectCategorizedOptionMap) => void;
  onFiterVisiblityChange: (
    columnIdentifier: ChartColumn,
    visibility: boolean
  ) => void;
}

export const NptFilterItem: React.FC<WithDragHandleProps<NptFilterProps>> = ({
  onNptCodesChange,
  onFiterVisiblityChange,
  ...dragHandleProps
}) => {
  const [nptCodes, setNptEvents] = useState<MultiSelectCategorizedOptionMap>(
    {}
  );

  const handleChangeNptFilter = (nptCodes: MultiSelectCategorizedOptionMap) => {
    setNptEvents(nptCodes);
    onNptCodesChange(nptCodes);
  };

  return (
    <FilterItem
      column={ChartColumn.NPT}
      onFiterVisiblityChange={onFiterVisiblityChange}
      {...dragHandleProps}
    >
      <DropDownIconStyler>
        <EventNptFilter
          selectedEvents={nptCodes}
          onChange={handleChangeNptFilter}
          iconInsteadText="Configure"
        />
      </DropDownIconStyler>
    </FilterItem>
  );
};
