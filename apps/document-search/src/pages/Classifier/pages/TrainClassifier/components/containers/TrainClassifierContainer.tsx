import React from 'react';

import styled from 'styled-components';

import { Flex, Body, Chip } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { PageHeader } from '../../../../../../components/page';
import { useClassifierActions } from '../../../../../../machines/classifier/hooks/useClassifierActions';
import { useClassifierManageTrainingSetsQuery } from '../../../../../../services/query';
import { ClassifierStatus } from '../../../../../../services/types';
import {
  isClassifierDone,
  isClassifierTraining,
} from '../../../../../../utils/classifier';
import TrainClassifierLabel from '../TrainClassifierLabel';

const Container = styled.div<{ $status?: string }>`
  width: 50rem;
  background-color: ${({ $status }) =>
    !$status ? 'var(--cogs-bg-status-large--default)' : 'white'};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid
    ${({ $status }) => (!$status ? '#dbe1fe' : 'var(--cogs-greyscale-grey4);')};
`;

const Wrapper = styled.div`
  margin-top: 1rem;
`;

interface Props {
  classifier?: Classifier;
  Action?: (
    isRunning: boolean,
    isDone: boolean,
    status?: ClassifierStatus
  ) => JSX.Element | JSX.Element[];
}

const TrainClassifierContainer: React.FC<Props> = ({ classifier, Action }) => {
  const { previousPage } = useClassifierActions();

  const { data: classifierTrainingSets } =
    useClassifierManageTrainingSetsQuery();

  const isRunning = isClassifierTraining(classifier);
  const isDone = isClassifierDone(classifier);

  const trainingSets = classifierTrainingSets.length;
  const trainingSetsFiles = classifierTrainingSets.reduce(
    (accumulator, item) => accumulator + (item.count || 0),
    0
  );

  return (
    <>
      <Container $status={classifier?.status}>
        <PageHeader
          title="Set up for label classifier"
          titleLevel={5}
          marginBottom="1rem"
          Action={<TrainClassifierLabel status={classifier?.status} />}
        />

        <Wrapper>
          <Flex gap={8} alignItems="center">
            <Body>Training classifier with</Body>
            <Chip
              icon="Edit"
              label={`${trainingSets} labels`}
              onClick={previousPage}
            />
            <Body>using</Body>
            <Chip
              icon="Edit"
              label={`${trainingSetsFiles} files`}
              onClick={previousPage}
            />
          </Flex>
        </Wrapper>

        {Action && (
          <Wrapper>
            {Action(
              isRunning,
              isDone,
              classifier?.status as ClassifierStatus | undefined
            )}
          </Wrapper>
        )}
      </Container>
    </>
  );
};

export default TrainClassifierContainer;
