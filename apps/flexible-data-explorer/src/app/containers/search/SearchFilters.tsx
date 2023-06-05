import React from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';

import { SearchBarFilter, ValueByDataType } from './Filter';

export interface SearchFiltersProps {
  value: ValueByDataType;
  onChange: (value: ValueByDataType) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = React.memo(
  ({ value, onChange }) => {
    const { t } = useTranslation();

    return (
      <>
        {/* <ChipGroup size="small" overflow={2}>
        <Chip type="neutral" label="Movie name starts with 'Harry Potter'" />
        <Chip type="neutral" label="Filter" />
        <Chip type="neutral" label="Filter" />
        <Chip type="neutral" label="Filter" />
      </ChipGroup> */}

        <Dropdown
          placement="bottom-end"
          content={<SearchBarFilter value={value} onChange={onChange} />}
        >
          <Button
            icon="Filter"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {t('filter_button', 'Filters')}
          </Button>
        </Dropdown>
      </>
    );
  }
);
