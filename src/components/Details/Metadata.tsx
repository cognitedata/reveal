import React, { useState, useMemo } from 'react';
import { Input } from 'antd';
import { Row } from 'react-table';
import { Checkbox, Table } from '@cognite/cogs.js';
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
    <>
      <MetadataHeader>
        <h3>Metadata</h3>
        <FilterContainer>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter metadata"
            allowClear
            style={{ maxWidth: '300px', marginRight: '16px' }}
          />
          <Checkbox
            name="hideEmpty"
            value={hideEmpty}
            onChange={(nextState: boolean) => setHideEmpty(nextState)}
          >
            Hide empty
          </Checkbox>
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
    </>
  );
}

const MetadataHeader = styled.div`
  padding: 0 16px;
`;

const MetadataTableContainer = styled.div`
  margin: 8px 16px 0;
  max-width: 900px;
  .metadata-table-row {
    background-color: var(--cogs-white);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`;
