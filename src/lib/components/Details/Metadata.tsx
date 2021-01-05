import React, { useState, useMemo } from 'react';
import { Input, Table } from 'antd';
import styled from 'styled-components';

export default function Metadata({
  metadata,
}: {
  metadata?: { [k: string]: string };
}) {
  const [query, setQuery] = useState('');

  const filteredMetadata = useMemo(
    () =>
      metadata
        ? Object.entries(metadata).filter(([key, value]) => {
            return (
              query.length === 0 ||
              key.toLowerCase().includes(query.toLowerCase()) ||
              value.toLowerCase().includes(query.toLowerCase())
            );
          })
        : [],
    [metadata, query]
  );
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }
  return (
    <>
      <MetadataHeader>
        <h3>Metadata</h3>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter metadata"
          allowClear
        />
      </MetadataHeader>
      <MetadataTableContainer>
        <Table
          dataSource={filteredMetadata.map(item => ({
            key: item[0],
            value: item[1],
          }))}
          columns={[
            {
              title: 'Key',
              dataIndex: 'key',
              key: 'key',
              width: '50%',
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              width: '50%',
            },
          ]}
          pagination={false}
          bordered
          rowClassName="metadata-table-row"
        />
      </MetadataTableContainer>
    </>
  );
}

const MetadataHeader = styled.div`
  padding: 0 16px;
  max-width: 300px;
`;

const MetadataTableContainer = styled.div`
  margin: 8px 16px 0;
  max-width: 900px;
  .metadata-table-row {
    background-color: var(--cogs-white);
  }
`;
