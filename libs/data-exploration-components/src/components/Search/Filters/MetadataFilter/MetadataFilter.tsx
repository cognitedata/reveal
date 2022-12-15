import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Body, Button } from '@cognite/cogs.js';
import { FilterForm } from 'components';
import { mergeUniqueMetadataKeys } from './utils';

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  align-items: center;
`;

export const MetadataFilter = <
  T extends { metadata?: { [key: string]: string } }
>({
  items,
  keys,
  value,
  setValue,
  useAggregates = false,
}: {
  items: T[];
  keys?: { value: string; count: number }[];
  value: { [key in string]: string } | undefined;
  setValue: (newValue: { [key in string]: string } | undefined) => void;
  useAggregates?: boolean;
}) => {
  const metadata = useMemo(() => {
    if (!useAggregates) {
      return mergeUniqueMetadataKeys(items);
    }
    return {};
  }, [useAggregates, items]);

  const setFilter = (newFilters: { [key: string]: string }) => {
    setValue(newFilters);
  };

  const clearFilters = () => {
    setValue({});
  };

  const showClearFiltersButton = Object.keys(value || {}).length > 0;

  return (
    <>
      <FilterHeader>
        <Body level={4} style={{ marginBottom: 5 }} className="title">
          Metadata
        </Body>
        {showClearFiltersButton && (
          <Button type="ghost" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </FilterHeader>

      <FilterForm
        metadata={metadata}
        keys={keys}
        filters={value}
        setFilters={setFilter}
        useAggregates={useAggregates}
      />
    </>
  );
};
