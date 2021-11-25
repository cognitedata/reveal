import { Body, Button, Flex, Label } from '@cognite/cogs.js';
import { Classifier } from '@cognite/sdk-playground';
import { PageHeader } from 'components/page';
import { TableCell } from 'components/table/TableCell';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 60rem;
  background-color: #fafafa;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #f5f5f5;
  margin-bottom: 2rem;
`;

const FlexWrapper = styled(Flex)`
  margin-top: 1rem;
`;

const MetricsLabel = styled(Body).attrs({ level: 3 })``;
const MetricsValue = styled(Body).attrs({ level: 2, strong: true })``;
const TextLabel = styled(Label).attrs({ variant: 'unknown', size: 'medium' })``;

interface Props {
  classifier?: Classifier;
  onViewConfusionMatrixClick?: () => void;
}

export const ActiveModelContainer: React.FC<Props> = ({
  classifier,
  onViewConfusionMatrixClick,
}) => {
  if (!classifier) {
    return (
      <Container>
        <PageHeader title="No active model" titleLevel={5} marginBottom="0" />

        <Body>
          Train a new model and deploy a finished classifier to the pipeline
        </Body>
      </Container>
    );
  }

  const metricsLabels = [
    {
      name: 'Build Time',
      Render: TableCell.Date({ value: classifier?.createdAt } as any),
    },
    {
      name: 'Accuracy',
      Render: TableCell.Number({
        value: classifier?.metrics?.recall,
      } as any),
    },
    {
      name: 'F1 Score',
      Render: TableCell.Number({
        value: classifier?.metrics?.f1Score,
      } as any),
    },
    {
      name: 'Precision',
      Render: TableCell.Number({
        value: classifier?.metrics?.precision,
      } as any),
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Active model"
        titleLevel={5}
        marginBottom="1rem"
        Action={
          <Label
            size="medium"
            variant={classifier.active ? 'default' : 'unknown'}
          >
            {classifier.active ? 'Currently running' : 'Inactive'}
          </Label>
        }
      />

      <Body level={2}>
        Trained with{' '}
        <TextLabel>
          {classifier.metrics?.labels?.length || '?'} labels
        </TextLabel>{' '}
        using{' '}
        <TextLabel>
          {(classifier as any)?.trainingSetSize || '?'} files
        </TextLabel>
      </Body>

      <FlexWrapper gap={24}>
        {metricsLabels.map(({ name, Render }) => (
          <MetricsLabel key={name}>
            {name}: <MetricsValue>{Render}</MetricsValue>
          </MetricsLabel>
        ))}
      </FlexWrapper>

      {onViewConfusionMatrixClick && (
        <FlexWrapper justifyContent="space-between" alignItems="center">
          <Button type="tertiary" onClick={onViewConfusionMatrixClick}>
            View confusion matrix
          </Button>
        </FlexWrapper>
      )}
    </Container>
  );
};
