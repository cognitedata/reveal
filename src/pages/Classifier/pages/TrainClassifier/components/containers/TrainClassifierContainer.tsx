import React from 'react';
import styled from 'styled-components';
import { PageHeader } from 'components/page';
import { isClassifierDone, isClassifierTraining } from 'utils/classifier';
import { Classifier } from '@cognite/sdk-playground';
import TrainClassifierLabel from 'pages/Classifier/pages/TrainClassifier/components/TrainClassifierLabel';

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
  Action?: (isRunning: boolean, isDone: boolean) => JSX.Element | JSX.Element[];
  Message?: JSX.Element | JSX.Element[];
}

const TrainClassifierContainer: React.FC<Props> = ({
  classifier,
  Action,
  Message,
}) => {
  const isRunning = isClassifierTraining(classifier);
  const isDone = isClassifierDone(classifier);

  return (
    <>
      <Container $status={classifier?.status}>
        <PageHeader
          title="Set up label classifier"
          titleLevel={5}
          Action={<TrainClassifierLabel status={classifier?.status} />}
        />
        {Message && <Wrapper>{Message}</Wrapper>}
        {Action && <Wrapper>{Action(isRunning, isDone)}</Wrapper>}
      </Container>
    </>
  );
};

export default TrainClassifierContainer;
