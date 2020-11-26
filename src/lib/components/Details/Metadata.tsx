import React, { useState, useMemo } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import { DetailsTabGrid, DetailsTabItem } from './Details';

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
        <Input.Search
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter metadata"
        />
      </MetadataHeader>
      <DetailsTabGrid>
        {filteredMetadata.map(([key, value]) => (
          <DetailsTabItem name={key} key={key} value={value} />
        ))}
      </DetailsTabGrid>
    </>
  );
}

const MetadataHeader = styled.div`
  padding: 0 16px;
`;
