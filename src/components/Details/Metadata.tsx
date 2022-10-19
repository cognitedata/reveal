import React, { useState, useMemo } from 'react';
import { Button, Input, Table, Title } from '@cognite/cogs.js';
import { Row } from 'react-table';
import styled from 'styled-components';

// TODO  Needs to be removed once implemented in our library
interface DataSource {
  id: string;
  key: string;
  value: string;
}

const sortTypes = {
  alphanumeric: (
    row1: Row<DataSource>,
    row2: Row<DataSource>,
    columnName: string
  ) => {
    const value1 = row1.values[columnName];
    const value2 = row2.values[columnName];
    const string1 = value1.toLowerCase();
    const string2 = value2.toLowerCase();
    if (string1 < string2) return -1;
    if (string1 > string2) return 1;
    return 0;
  },
};

export function Metadata({ metadata }: { metadata?: { [k: string]: string } }) {
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);

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
        <Table<DataSource>
          dataSource={filteredMetadata.map(item => ({
            key: item[0],
            id: item[0],
            value: item[1],
          }))}
          // @ts-ignore
          tableConfig={{ sortTypes }}
          columns={[
            {
              Header: 'Key',
              accessor: 'key',
              width: '50%',
            },
            {
              Header: 'Value',
              accessor: 'value',
              width: '50%',
            },
          ]}
          pagination={false}
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
  margin: 8px 16px 0;
  max-width: 900px;
  overflow: auto;

  tr[role='row'],
  tr[role='row'].cogs-table-row {
    background: transparent;

    th,
    td {
      border-bottom: 1px solid var(--cogs-border--muted);
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
