import React from 'react';
import { Graphic } from '@cognite/cogs.js';
import styled from 'styled-components';

type Props = {
  message: string;
  fullView?: boolean;
};

const Container = styled.div<{ fullView: boolean }>`
  width: 100%;
  height: ${(props) => (props.fullView ? '100vh' : 'auto')};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: ${(props) => (props.fullView ? '0' : '1rem')};
  color: var(--cogs-black);
`;

const Heading = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25em;
`;

const ErrorMessage = ({ message, fullView = false }: Props) => {
  return (
    <Container fullView={fullView}>
      <Graphic type="ChartData" />
      <Heading>Error</Heading>
      <p>{message}</p>
    </Container>
  );
};

export default ErrorMessage;
