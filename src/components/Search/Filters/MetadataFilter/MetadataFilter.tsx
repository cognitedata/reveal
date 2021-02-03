import React from 'react';
import styled from 'styled-components';
import { Body, Button } from '@cognite/cogs.js';
import { FilterForm } from 'components';

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
  let metadata = {};

  // No need to extract metadata if keys are already supplied by the API
  if (!useAggregates) {
    const tmpMetadata = items.reduce((prev, el) => {
      Object.keys(el.metadata || {}).forEach(key => {
        if (el.metadata![key].length !== 0) {
          if (!prev[key]) {
            prev[key] = new Set<string>();
          }
          prev[key].add(el.metadata![key]);
        }
      });
      return prev;
    }, {} as { [key: string]: Set<string> });

    metadata = Object.keys(tmpMetadata).reduce((prev, key) => {
      prev[key] = [...tmpMetadata[key]];
      return prev;
    }, {} as { [key: string]: string[] });
  }

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
          <Button type="secondary" variant="ghost" onClick={clearFilters}>
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
