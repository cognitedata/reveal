import React from 'react';

import styled from 'styled-components';

import { motion } from 'framer-motion';

import { Body, Button, Flex, Chip, Title } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';

import { metricsLabels } from './utils';

const Container = styled(motion.div)<{ $fullWidth?: boolean }>`
  width: ${(props) => (props.$fullWidth ? '100%' : '60rem')};
  background-color: #fafafa;
  padding: 1rem;
  padding-top: 0;
  border-radius: 8px;
  border: 2px solid #f5f5f5;
  margin-bottom: 2rem;
`;

const FlexWrapper = styled(Flex)`
  margin-top: 1rem;
`;

const MetricsWrapper = styled(FlexWrapper)`
  justify-content: space-between;
  width: 45rem;
`;

interface Props {
  classifier?: Classifier;
  onViewConfusionMatrixClick?: () => void;
  fullWidth?: boolean;
}

export const ActiveModelContainer: React.FC<Props> = ({
  classifier,
  onViewConfusionMatrixClick,
  fullWidth,
}) => {
  if (!classifier) {
    return (
      <Container>
        <FlexWrapper direction="column">
          <Title level={5}>No deployed model</Title>

          <Body>
            Train a new model and deploy a finished classifier to the pipeline
          </Body>
        </FlexWrapper>
      </Container>
    );
  }

  return (
    <Container $fullWidth={fullWidth}>
      <FlexWrapper alignItems="center" justifyContent="space-between">
        <Title level={5}>Deployed model</Title>
      </FlexWrapper>

      <FlexWrapper alignItems="center" gap={8}>
        <Body level={2}>Trained with</Body>
        <Chip
          label={`${classifier.metrics?.labels?.length || '?'}` + ' labels'}
        />
        <Body level={2}>using</Body>
        <Chip
          label={`${(classifier as any)?.trainingSetSize || '?'}` + ' labels'}
        />
      </FlexWrapper>

      <MetricsWrapper>
        {metricsLabels(classifier).map(({ name, Value }) => (
          <Flex key={name} direction="column" gap={4}>
            <Body level={3} strong>
              {name}:
            </Body>
            <Body level={2}>{Value}</Body>
          </Flex>
        ))}
      </MetricsWrapper>

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
