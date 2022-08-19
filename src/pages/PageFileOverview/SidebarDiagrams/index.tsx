import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Colors, Input } from '@cognite/cogs.js';
import { useWorkflowItems } from 'modules/workflows';
import { stringContains } from 'utils/utils';
import ItemsList from './ItemsList';

export default function JobDiagrams() {
  const { workflowId } =
    useParams<{ project: string; workflowId: string; fileId: string }>();
  const { diagrams } = useWorkflowItems(Number(workflowId), true);
  const [query, setQuery] = useState<string>('');

  const filteredDiagrams = diagrams.filter((file) =>
    stringContains(file.name, query)
  );

  return (
    <ListWrapper>
      <SearchBoxWrapper
        placeholder="File name"
        onChange={(e) => setQuery(e.currentTarget.value)}
        value={query}
        style={{ width: '100%' }}
      />
      <ItemsList diagrams={filteredDiagrams} />
    </ListWrapper>
  );
}

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-width: 200px;
  align-content: space-around;
  font-family: 'Inter';
  font-weight: 600;
  padding: 16px 8px 0 8px;
  box-sizing: border-box;
  border-right: 1px solid ${Colors['greyscale-grey4'].hex()};
  color: ${Colors['greyscale-grey6'].hex()};
`;

const SearchBoxWrapper = styled(Input)`
  border: 2px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 6px;
  position: sticky;
  margin: 0 8px 16px 0;
`;
