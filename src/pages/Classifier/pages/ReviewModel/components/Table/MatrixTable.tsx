import { Table } from '@cognite/cogs.js';
import { Classifier } from '@cognite/sdk-playground';
import React from 'react';
import styled from 'styled-components';
import { ConfusionMatrix, mapConfusionMatrix } from 'utils/matrix';
import { curateColumns } from './curateMatrixColumns';

interface Props {
  classifier: Classifier;
}

const Container = styled.div`
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 8px;
  padding: 0.15rem;
`;

export const MatrixTable: React.FC<Props> = ({ classifier }) => {
  const { labels = [], confusionMatrix = [] } = classifier?.metrics || {};
  const columns = React.useMemo(() => curateColumns(labels), [labels]);

  const matrix = mapConfusionMatrix(confusionMatrix, labels);

  return (
    <Container>
      <Table<ConfusionMatrix>
        pagination={false}
        dataSource={matrix}
        columns={columns as any}
      />
    </Container>
  );
};
