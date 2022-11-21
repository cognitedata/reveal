import React, { useState, useMemo } from 'react';
import { Button, Title } from '@cognite/cogs.js';
import { Table } from 'components/Table';
import { ColumnDef } from '@tanstack/react-table';
import {
  FilterContainer,
  FilterInput,
  MetadataCard,
  MetadataHeader,
  MetadataTableContainer,
} from './elements';

// TODO  Needs to be removed once implemented in our library
interface DataSource {
  id: string;
  key: string;
  value: string;
}

export function Metadata({ metadata }: { metadata?: { [k: string]: string } }) {
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const columns = useMemo(
    () =>
      [
        {
          header: 'Key',
          accessorKey: 'key',
        },
        {
          header: 'Value',
          accessorKey: 'value',
        },
      ] as ColumnDef<DataSource>[],
    []
  );

  const filteredMetadata = useMemo(
    () =>
      metadata
        ? Object.entries(metadata)
            .filter(([key, value]) => {
              if (hideEmpty && !value) {
                return false;
              }
              return (
                query.length === 0 ||
                key.toLowerCase().includes(query.toLowerCase()) ||
                value.toLowerCase().includes(query.toLowerCase())
              );
            })
            .map(([key, value]) => [key.trim(), value.trim()])
            .map(item => ({
              key: item[0],
              id: item[0],
              value: item[1],
            }))
        : [],
    [metadata, query, hideEmpty]
  );
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  return (
    <MetadataCard>
      <MetadataHeader>
        <Title level={5}>Metadata</Title>
        <FilterContainer>
          <FilterInput
            value={query}
            placeholder="Filter"
            size="small"
            variant="noBorder"
            onChange={e => setQuery(e.target.value)}
          />
          <Button
            name="hideEmpty"
            type="secondary"
            size="small"
            onClick={() => setHideEmpty(hideEmpty => !hideEmpty)}
          >
            {hideEmpty ? 'Show' : 'Hide'} empty
          </Button>
        </FilterContainer>
      </MetadataHeader>
      <MetadataTableContainer>
        <Table<DataSource>
          id="metadata-table"
          data={filteredMetadata}
          enableSorting
          columns={columns}
        />
      </MetadataTableContainer>
    </MetadataCard>
  );
}
