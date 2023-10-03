import React, { CSSProperties } from 'react';

import styled from 'styled-components';

import { Button, Dropdown } from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';
import { SearchBarFilter, ValueByDataType, AppliedFilters } from '../Filter';

export interface SearchFiltersProps {
  dataType?: string;
  value?: ValueByDataType;
  onChange: (value: ValueByDataType) => void;
  onClick?: () => void;
  filterMenuMaxHeight?: CSSProperties['maxHeight'];
}

export const SearchFilters: React.FC<SearchFiltersProps> = React.memo(
  ({ value, onChange, onClick, filterMenuMaxHeight }) => {
    const { t } = useTranslation();

    return (
      <>
        <AppliedFilters value={value} onRemove={onChange} />

        <Dropdown
          placement="bottom-end"
          content={
            <SearchBarFilterWrapper filterMenuMaxHeight={filterMenuMaxHeight}>
              <SearchBarFilter value={value} onChange={onChange} />
            </SearchBarFilterWrapper>
          }
        >
          <Button
            icon="Filter"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.();
            }}
          >
            {t('FILTER_BUTTON')}
          </Button>
        </Dropdown>
      </>
    );
  }
);

const SearchBarFilterWrapper = styled.div<{
  filterMenuMaxHeight?: CSSProperties['maxHeight'];
}>`
  .cogs-menu {
    max-height: ${({ filterMenuMaxHeight }) => filterMenuMaxHeight};
  }
`;
