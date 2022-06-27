import { useState } from 'react';
import styled from 'styled-components';

import { CreateSchemaModal } from './components/CreateSchemaModal';
import { RunnerModal } from './components/RunnerModal';
import { SchemaList } from './components/Schema/List';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;

  padding: 32px;
`;

export const List = () => {
  const [label, setLabel] = useState<string | undefined>(undefined);

  const handleRun = (labelExternalId: string) => setLabel(labelExternalId);
  const finishRun = () => setLabel(undefined);

  return (
    <Container>
      <SchemaList onRun={handleRun} />
      <CreateSchemaModal />
      {label && (
        <RunnerModal labelExternalId={label} onModalClose={finishRun} />
      )}
    </Container>
  );
};
