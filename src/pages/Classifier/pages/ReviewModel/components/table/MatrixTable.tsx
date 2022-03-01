import { Flex, Table, Detail, Icon } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { TableWrapper } from 'components/table/TableWrapper';
import React from 'react';
import styled from 'styled-components';
import { ConfusionMatrix, mapConfusionMatrix } from 'utils/matrix';
import { curateColumns } from './curateMatrixColumns';

const Container = styled.div`
  height: 100%;
  width: 100%;
`;

const HorizontalText = styled(Detail)`
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  margin-bottom: 0.5rem;
`;

const VerticalText = styled(HorizontalText)`
  writing-mode: vertical-rl;
  margin-top: 2rem;
  margin-right: 0.5rem;
`;

interface Props {
  classifier?: Classifier;
}

export const MatrixTable: React.FC<Props> = ({ classifier }) => {
  const { labels = [], confusionMatrix = [] } = classifier?.metrics || {};
  const columns = React.useMemo(() => curateColumns(labels), [labels]);

  const matrix = mapConfusionMatrix(confusionMatrix, labels);

  return (
    <Flex>
      <VerticalText>
        True label <Icon type="ArrowDown" />
      </VerticalText>

      <Flex direction="column">
        <HorizontalText>
          Predicted label <Icon type="ArrowRight" />
        </HorizontalText>

        <TableWrapper
          alignValuesCenter
          stickyHeader
          stickyFirstColumn
          extraBorders
        >
          <Container>
            <Table<ConfusionMatrix>
              pagination={false}
              dataSource={matrix}
              columns={columns as any}
            />
          </Container>
        </TableWrapper>
      </Flex>
    </Flex>
  );
};
