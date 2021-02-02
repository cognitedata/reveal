import React, { useState } from 'react';
import { format } from 'date-fns';

import { Button } from '@cognite/cogs.js';
import { SelectedDateRangeType } from 'typings/interfaces';

import { FiltersProps, FilterTypes, FilterListFilters } from './types';
import { getDateFilter, getFilters } from './FilterContent';
import { FilterList } from './FilterList';
import { RenderSecondaryFilters } from './RenderSecondaryFilters';
import {
  FiltersWrapper,
  StartContainer,
  DropdownWrapper,
  DropdownSeparator,
} from './elements';

const Filters = ({
  source,
  target,
  date,
  datatype,
  configuration,
  onNameSearchChange,
}: FiltersProps) => {
  const [nameFilter, setNameFilter] = useState('');
  const [openFilter, setOpenFilter] = useState<keyof FilterTypes | ''>('');

  const filters: FilterTypes = getFilters(
    source,
    target,
    datatype,
    configuration,
    setOpenFilter
  );

  if (!source.sources || source.sources.length < 1) {
    return null;
  }

  const DateContent = getDateFilter(date, setOpenFilter, openFilter === 'date');

  const getFormattedDateRange = (selectedRange: SelectedDateRangeType) => {
    const first = selectedRange[0];
    const second = selectedRange[1];
    if (first && second) {
      return `${format(first, 'P')} - ${format(second, 'P')}`;
    }
    return selectedRange.join(' - ');
  };

  const resetFilters = () => {
    setNameFilter('');
    source.onSelectSource('');
    target.onSelectTarget('');
    configuration.onSelectConfiguration(null);
    datatype.onSelectType('');
    date.onSelectDate(null);
  };

  const toggleFilter = (filterName: keyof FilterTypes) => {
    setOpenFilter(openFilter === filterName ? '' : filterName);
  };

  const closeFilters = () => {
    setOpenFilter('');
  };

  const configurationFilterList: FilterListFilters = [
    {
      name: 'config',
      label: 'Configuration',
      content: filters.config,
      visible: true,
      buttonText: configuration.selected
        ? configuration.selected.name
        : 'Select',
    },
  ];

  const sourceFilterList: FilterListFilters = [
    {
      name: 'source',
      label: 'Source',
      content: filters.source,
      visible: !!(source.sources.length > 0 && filters.source),
      buttonText: source.selected || 'Select',
    },
    {
      name: 'sourceProject',
      label: 'Source project',
      content: filters.sourceProject,
      visible: !!(
        source.selected &&
        source.projects.length > 0 &&
        filters.sourceProject
      ),
      buttonText: source.selectedProject
        ? source.selectedProject.external_id
        : 'Select project',
    },
    {
      name: 'target',
      label: 'Target',
      content: filters.target,
      visible: !!(
        source.selected &&
        source.selectedProject &&
        target.targets.length > 0 &&
        filters.target
      ),
      buttonText: target.selected || 'Select',
    },
    {
      name: 'targetProject',
      label: 'Target project',
      content: filters.targetProject,
      visible: !!(
        target.selected &&
        target.projects.length > 0 &&
        filters.targetProject
      ),
      buttonText: target.selectedProject
        ? target.selectedProject.external_id
        : 'Select',
    },
  ];

  return (
    <FiltersWrapper>
      <>
        {configuration.configurations.length > 0 && filters.config && (
          <StartContainer>
            <DropdownWrapper disabled={!!source.selected}>
              <FilterList
                closeHandler={closeFilters}
                toggleFilter={toggleFilter}
                openFilter={openFilter}
                filters={configurationFilterList}
              />
            </DropdownWrapper>
            <DropdownSeparator>or</DropdownSeparator>
            <DropdownWrapper disabled={!!configuration.selected}>
              <FilterList
                closeHandler={closeFilters}
                toggleFilter={toggleFilter}
                openFilter={openFilter}
                filters={sourceFilterList}
              />
            </DropdownWrapper>

            <Button
              variant="ghost"
              type="danger"
              disabled={!source.selected && !configuration.selected}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </StartContainer>
        )}

        {(configuration.selected ||
          (source.selected &&
            source.selectedProject &&
            target.selected &&
            target.selectedProject)) && (
          <RenderSecondaryFilters
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            onNameSearchChange={onNameSearchChange}
            openFilter={openFilter}
            datatype={datatype}
            filters={filters}
            closeFilters={closeFilters}
            toggleFilter={toggleFilter}
            DateContent={DateContent}
            date={date}
            getFormattedDateRange={getFormattedDateRange}
          />
        )}
      </>
    </FiltersWrapper>
  );
};

export default Filters;
