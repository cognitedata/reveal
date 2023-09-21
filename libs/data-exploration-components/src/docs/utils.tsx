import React from 'react';

import styled from 'styled-components';

import { DataExplorationProvider } from '../context';

import { sdkMock } from './stub';

export const Container = styled.div`
  width: 100%;
  display: flex;
`;

export const Wrapper = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <Container style={style}>
    {/** @ts-ignores */}
    <DataExplorationProvider sdk={sdkMock}>{children}</DataExplorationProvider>
  </Container>
);
