import { useEffect, useState } from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';

import { EventNptFilter } from '../../measurements/filters/EventNptFilter';
import { COLUMNS } from '../WellboreCasingView/constants';

import { FilterItem } from './FilterItem';

export interface NptFilterProps {
  onNptCodesChange: (events: MultiSelectCategorizedOptionMap) => void;
  onFiterVisiblityChange: (
    columnIdentifier: string,
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

  useEffect(() => {
    onNptCodesChange(nptCodes);
  }, [nptCodes]);

  return (
    <FilterItem
      text="NPT"
      column={COLUMNS.NPT}
      key={COLUMNS.NPT}
      onFiterVisiblityChange={onFiterVisiblityChange}
      {...dragHandleProps}
    >
      <EventNptFilter
        selectedEvents={nptCodes}
        onChange={setNptEvents}
        iconInsteadText="Configure"
      />
    </FilterItem>
  );
};
