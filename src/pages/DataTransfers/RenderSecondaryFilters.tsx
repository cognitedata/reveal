import React from 'react';
import 'antd/es/date-picker/style/index';
import { Dropdown, Input, Tooltip, Button } from '@cognite/cogs.js';
import { SelectedDateRangeType } from 'typings/interfaces';
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns';
import generatePicker from 'antd/es/date-picker/generatePicker';

import {
  FilterDataTypeType,
  FilterDateType,
  FilterListFilters,
  FilterTypes,
} from './types';
import {
  SecondaryFilters,
  DropdownButton,
  DateDropdownWrapper,
  CalendarWrapper,
  CalendarBtnWrapper,
} from './elements';
import { FilterList } from './FilterList';

const DatePicker = generatePicker<Date>(dateFnsGenerateConfig);
const { RangePicker } = DatePicker;

export const getDateFilter = (
  date: FilterDateType,
  toggleFilter: (openFilter: keyof FilterTypes) => void,
  closeFilters: () => void,
  openFilter: keyof FilterTypes | ''
) => (
  <CalendarWrapper>
    <RangePicker
      onChange={(selected) => {
        date.onSelectDate(selected);
        closeFilters();
      }}
      value={date.selectedRange}
      open={openFilter === 'date'}
      popupStyle={{ backgroundColor: 'white', paddingTop: '52px' }}
    />
    <Button
      className="close-button"
      icon="Close"
      iconPlacement="right"
      size="small"
      variant="outline"
      aria-label="Close"
      onClick={() => toggleFilter('date')}
    >
      Close
    </Button>
  </CalendarWrapper>
);

interface Props {
  date: FilterDateType;
  datatype: FilterDataTypeType;
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
  nameFilter,
  setNameFilter,
  onNameSearchChange,
  openFilter,
  closeFilters,
  toggleFilter,
  getFormattedDateRange,
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
      <FilterList
        closeHandler={closeFilters}
        toggleFilter={toggleFilter}
        openFilter={openFilter}
        filters={secondaryFiltersList}
      />
      <DateDropdownWrapper>
        <Dropdown
          content={getDateFilter(date, toggleFilter, closeFilters, openFilter)}
          visible={openFilter === 'date'}
        >
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
};
