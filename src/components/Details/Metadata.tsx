import React, { useState, useMemo } from 'react';
import { Button, Input, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { TableV2 } from 'components/ReactTable/V2';
import { ColumnDef } from '@tanstack/react-table';

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
          <Input
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
        <TableV2<DataSource>
          id="metadata-table"
          data={filteredMetadata}
          enableSorting
          columns={columns}
        />
      </MetadataTableContainer>
    </MetadataCard>
  );
}

const MetadataCard = styled.div`
  background-color: var(--cogs-surface--medium);
  border-radius: 8px;
`;

const MetadataHeader = styled.div`
  padding: 16px 12px;
  height: 53px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid var(--cogs-border--muted);
`;

const MetadataTableContainer = styled.div`
  white-space: pre;
  overflow: auto;

  & > div {
    padding: 0px;
  }

  .data-exploration-table {
    background-color: var(--cogs-surface-medium);
    & > div {
      max-width: 100%;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  margin-bottom: 16px;

  .cogs-input {
    margin-right: 8px;
  }
`;
