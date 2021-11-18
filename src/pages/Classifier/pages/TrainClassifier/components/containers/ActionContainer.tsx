import React from 'react';
import styled from 'styled-components';
import { Label, LabelVariants } from '@cognite/cogs.js';
import { PageHeader } from 'components/page';
import { ClassifierStatus } from 'services/types';
import { isClassifierDone, isClassifierTraining } from 'utils/classifier';
import { Classifier } from '@cognite/sdk-playground';

const Container = styled.div<{ $state?: ClassifierStatus }>`
  width: 50rem;
  background-color: ${({ $state }) =>
    !$state ? 'var(--cogs-bg-status-large--default)' : 'white'};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid
    ${({ $state }) => (!$state ? '#dbe1fe' : 'var(--cogs-greyscale-grey4);')};
`;

const Wrapper = styled.div`
  margin-top: 1rem;
`;

interface Props {
  classifier?: Classifier;
  Action?: (isRunning: boolean, isDone: boolean) => JSX.Element | JSX.Element[];
  Message?: JSX.Element | JSX.Element[];
}

const classifierStatusLabels = (
  state?: ClassifierStatus
): { text: string; variant?: LabelVariants } => {
  switch (state) {
    case 'queuing':
    case 'training': {
      return {
        text: 'Training',
        variant: 'warning',
      };
    }
    case 'finished': {
      return {
        text: 'Done',
        variant: 'success',
      };
    }
    case 'failed': {
      return {
        text: 'Failed',
        variant: 'danger',
      };
    }
    default: {
      return {
        text: 'Ready to run',
        variant: 'default',
      };
    }
  }
};

const ActionContainer: React.FC<Props> = ({ classifier, Action, Message }) => {
  const isRunning = isClassifierTraining(classifier);
  const isDone = isClassifierDone(classifier);

  const { text, variant } = classifierStatusLabels(
    classifier?.status as ClassifierStatus | undefined
  );

  return (
    <>
      <Container $state="training">
        <PageHeader
          title="Set up label classifier"
          titleLevel={5}
          Action={
            <Label size="small" variant={variant}>
              {text}
            </Label>
          }
        />
        {Message && <Wrapper>{Message}</Wrapper>}
        {Action && <Wrapper>{Action(isRunning, isDone)}</Wrapper>}
      </Container>
    </>
  );
};

export default ActionContainer;
