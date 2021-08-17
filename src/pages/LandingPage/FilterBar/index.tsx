import React from 'react';
import { Input } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import { FileRequestFilter, InternalId } from '@cognite/cdf-sdk-singleton';
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
    <Flex row style={{ gap: '10px' }}>
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
        loaded
        isMulti={false}
      />
    </Flex>
  );
}
