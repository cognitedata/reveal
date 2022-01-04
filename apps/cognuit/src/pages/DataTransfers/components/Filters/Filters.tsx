import { useState, FC } from 'react';

import { FiltersProps, FilterTypes, FilterListFilters } from './types';
import { FilterList } from './FilterList';
import { FiltersWrapper, StartContainer, DropdownWrapper } from './elements';

export const Filters: FC<FiltersProps> = ({ configuration }) => {
  const [openFilter, setOpenFilter] = useState<keyof FilterTypes | ''>('');

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
      source: configuration.configurations,
      visible: true,
      onSelect: configuration.onSelectConfiguration,
      value: configuration?.selected?.name,
    },
  ];

  return (
    <FiltersWrapper>
      <>
        {configuration.configurations.length > 0 && (
          <StartContainer>
            <DropdownWrapper>
              <FilterList
                closeHandler={closeFilters}
                toggleFilter={toggleFilter}
                openFilter={openFilter}
                filters={configurationFilterList}
              />
            </DropdownWrapper>
          </StartContainer>
        )}
      </>
    </FiltersWrapper>
  );
};
