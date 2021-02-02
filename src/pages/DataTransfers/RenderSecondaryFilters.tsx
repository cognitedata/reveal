import React from 'react';
import { Dropdown, Input, Tooltip } from '@cognite/cogs.js';
import { SelectedDateRangeType } from 'typings/interfaces';

import { FilterDataTypeType, FilterDateType, FilterTypes } from './types';
import {
  DropdownLabel,
  SecondaryFilters,
  DropdownButton,
  DateDropdownWrapper,
  CalendarBtnWrapper,
} from './elements';

interface Props {
  date: FilterDateType;
  datatype: FilterDataTypeType;
  DateContent: JSX.Element;
  filters: FilterTypes;
  nameFilter: string;
  setNameFilter: (name: string) => void;
  onNameSearchChange: (searchString: string) => void;
  openFilter: keyof FilterTypes | '';
  closeFilters: () => void;
  toggleFilter: (filterName: keyof FilterTypes) => void;
  getFormattedDateRange: (selectedRange: SelectedDateRangeType) => string;
}

export const RenderSecondaryFilters = ({
  date,
  datatype,
  DateContent,
  filters,
  nameFilter,
  setNameFilter,
  onNameSearchChange,
  openFilter,
  closeFilters,
  toggleFilter,
  getFormattedDateRange,
}: Props) => (
  <SecondaryFilters>
    <Input
      value={nameFilter}
      icon="Search"
      iconPlacement="left"
      onChange={(e) => {
        setNameFilter(e.target.value);
        onNameSearchChange(e.target.value);
      }}
      title="Filter by name"
      placeholder="Search by name"
      className={openFilter !== 'date' ? 'input-visible' : 'input-hidden'}
    />
    {datatype.types.length > 0 && filters?.dataTypes && openFilter !== 'date' && (
      <Dropdown
        content={filters.dataTypes}
        visible={openFilter === 'dataTypes'}
        onClickOutside={closeFilters}
      >
        <>
          <DropdownLabel>Datatype</DropdownLabel>
          <DropdownButton
            icon="Down"
            iconPlacement="right"
            onClick={() => toggleFilter('dataTypes')}
          >
            {datatype.selected || 'Select datatype'}
          </DropdownButton>
        </>
      </Dropdown>
    )}
    <DateDropdownWrapper>
      <Dropdown content={DateContent} visible={openFilter === 'date'}>
        <>
          {openFilter !== 'date' && (
            <Tooltip
              content={
                date.selectedRange
                  ? getFormattedDateRange(date.selectedRange)
                  : 'Filter by updated date'
              }
            >
              <CalendarBtnWrapper active={date.selectedRange !== null}>
                <DropdownButton
                  unstyled
                  icon="Calendar"
                  onClick={() => toggleFilter('date')}
                  aria-label="Filter by updated date"
                />
              </CalendarBtnWrapper>
            </Tooltip>
          )}
        </>
      </Dropdown>
    </DateDropdownWrapper>
  </SecondaryFilters>
);
