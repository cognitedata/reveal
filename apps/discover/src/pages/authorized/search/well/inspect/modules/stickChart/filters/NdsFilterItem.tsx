import { useState } from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { EventNdsFilter } from '../../measurements/filters/EventNdsFilter';
import { ChartColumn } from '../types';

import { FilterItem } from './FilterItem';

export interface NdsFilterProps {
  onNdsCodesChange: (events: MultiSelectCategorizedOptionMap) => void;
  onFiterVisiblityChange: (
    columnIdentifier: ChartColumn,
    visibility: boolean
  ) => void;
}

export const NdsFilterItem: React.FC<WithDragHandleProps<NdsFilterProps>> = ({
  onNdsCodesChange,
  onFiterVisiblityChange,
  ...dragHandleProps
}) => {
  const [ndsCodes, setNdsEvents] = useState<MultiSelectCategorizedOptionMap>(
    {}
  );

  const handleChangeNptFilter = (ndsCodes: MultiSelectCategorizedOptionMap) => {
    setNdsEvents(ndsCodes);
    onNdsCodesChange(ndsCodes);
  };

  return (
    <FilterItem
      column={ChartColumn.NDS}
      onFiterVisiblityChange={onFiterVisiblityChange}
      {...dragHandleProps}
    >
      <EventNdsFilter
        selectedEvents={ndsCodes}
        onChange={handleChangeNptFilter}
        iconInsteadText="Configure"
      />
    </FilterItem>
  );
};
