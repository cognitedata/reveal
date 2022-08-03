import { useEffect, useState } from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { EventNdsFilter } from '../../measurements/filters/EventNdsFilter';
import { COLUMNS } from '../WellboreCasingView/constants';

import { FilterItem } from './FilterItem';

export interface NdsFilterProps {
  onNdsCodesChange: (events: MultiSelectCategorizedOptionMap) => void;
  onFiterVisiblityChange: (
    columnIdentifier: string,
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

  useEffect(() => {
    onNdsCodesChange(ndsCodes);
  }, [ndsCodes]);

  return (
    <FilterItem
      text="NDS"
      column={COLUMNS.NDS}
      key={COLUMNS.NDS}
      onFiterVisiblityChange={onFiterVisiblityChange}
      {...dragHandleProps}
    >
      <EventNdsFilter
        selectedEvents={ndsCodes}
        onChange={setNdsEvents}
        iconInsteadText="Configure"
      />
    </FilterItem>
  );
};
