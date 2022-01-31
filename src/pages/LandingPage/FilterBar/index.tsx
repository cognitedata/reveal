import React from 'react';
import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { FileRequestFilter, InternalId } from '@cognite/sdk';
import { DataSetSelect, MimeTypeSelect } from 'components/Filters';

interface FilterBarProps {
  query: string;
  setQuery: (val: string) => void;
  filters: FileRequestFilter;
  setFilters: (f: FileRequestFilter) => void;
}
export default function FilterBar({
  query,
  setQuery,
  filters,
  setFilters,
}: FilterBarProps) {
  const mimeType = filters.filter?.mimeType;
  const dataSetIds = filters.filter?.dataSetIds || [];

  const onDataSetSelected = (datasets: number[]) => {
    setFilters({
      filter: {
        ...filters.filter,
        dataSetIds: datasets.length
          ? datasets.map((id) => ({ id }))
          : undefined,
      },
    });
  };

  const onMimeTypeSelected = (selectedMimeType: string[]) => {
    const selectedMimetype = selectedMimeType[0] ?? undefined;
    setFilters({
      filter: {
        ...filters.filter,
        mimeType: selectedMimetype,
      },
    });
  };

  return (
    <Wrapper>
      <Input
        placeholder="Filter by name..."
        onChange={(e) => setQuery(e.currentTarget.value)}
        value={query}
      />
      <DataSetSelect
        resourceType="files"
        selectedDataSetIds={
          dataSetIds.map((item) => (item as InternalId).id) as number[]
        }
        onDataSetSelected={onDataSetSelected}
      />
      <MimeTypeSelect
        selectedMimeType={mimeType ? [mimeType] : undefined}
        onMimeTypeSelected={onMimeTypeSelected}
        isMulti={false}
        loaded
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 20px 0;
  justify-content: flex-start;

  & > * {
    margin-right: 8px;
  }
`;
