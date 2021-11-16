import React from 'react';
import styled from 'styled-components';
import { Label, LabelVariants, Title } from '@cognite/cogs.js';

const Container = styled.div<{ $state?: Props['state'] }>`
  width: 45rem;
  background-color: ${({ $state }) =>
    !$state ? 'var(--cogs-bg-status-large--default)' : 'white'};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid
    ${({ $state }) => (!$state ? '#dbe1fe' : 'var(--cogs-greyscale-grey4);')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  margin-top: 1rem;
`;

interface Props {
  state?: 'queuing' | 'training' | 'finished' | 'failed';
  Action?: (isRunning: boolean, isDone: boolean) => JSX.Element | JSX.Element[];
  Message?: JSX.Element | JSX.Element[];
}

const classifierStateLabels = (
  state: Props['state']
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

const ActionContainer: React.FC<Props> = ({ state, Action, Message }) => {
  const isQueuingState = state === 'queuing';
  const isTrainingState = state === 'training';
  const isFailedState = state === 'failed';
  const isFinishedState = state === 'finished';

  const isRunning = isQueuingState || isTrainingState;
  const isDone = isFinishedState || isFailedState;

  const { text, variant } = classifierStateLabels(state);

  return (
    <Container $state={state}>
      <Header>
        <Title level={5}>Set up label classifier</Title>
        <Label size="small" variant={variant}>
          {text}
        </Label>
      </Header>
      {Message && <Wrapper>{Message}</Wrapper>}
      {Action && <Wrapper>{Action(isRunning, isDone)}</Wrapper>}
    </Container>
  );
};

export default ActionContainer;
