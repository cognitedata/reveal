import { Range, DateRange } from '@cognite/cogs.js';
import Label from 'components/Atoms/Label';

import {
  FilterDataTypeType,
  FilterDateType,
  FilterListFilters,
  FilterTypes,
} from './types';
import { StartContainer, FieldWrapper } from './elements';
import { FilterList } from './FilterList';

interface Props {
  date: FilterDateType;
  datatype: FilterDataTypeType;
  openFilter: keyof FilterTypes | '';
  closeFilters: () => void;
  toggleFilter: (filterName: keyof FilterTypes) => void;
}

export const RenderSecondaryFilters = ({
  date,
  datatype,
  openFilter,
  closeFilters,
  toggleFilter,
}: Props) => {
  const secondaryFiltersList: FilterListFilters = [
    {
      name: 'dataTypes',
      label: 'Datatype',
      source: datatype.types,
      visible: !!(datatype.types.length > 0 && openFilter !== 'date'),
      onSelect: datatype.onSelectType,
      value: datatype.selected,
    },
  ];

  return (
    <StartContainer>
      <FilterList
        onReset={() => datatype.onSelectType(null)}
        resetText="All DataTypes"
        placeholder="All"
        closeHandler={closeFilters}
        toggleFilter={toggleFilter}
        openFilter={openFilter}
        filters={secondaryFiltersList}
      />
      <FieldWrapper>
        <Label>Filter by date</Label>
        <DateRange
          showClose
          months={2}
          direction="horizontal"
          startDatePlaceholder="From date"
          endDatePlaceholder="To date"
          onChange={(range: Range) => {
            date.onSelectDate(range);
            closeFilters();
          }}
          range={date.selectedRange}
        />
      </FieldWrapper>
    </StartContainer>
  );
};
