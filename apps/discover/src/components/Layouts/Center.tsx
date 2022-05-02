import React from 'react';

import styled from 'styled-components/macro';

import { FlexColumn } from 'styles/layout';

const Container = styled(FlexColumn)`
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex: 1;
`;
const Content = styled.div`
  min-height: 50%;
  text-align: center;
  width: 100%;
`;

interface Props {
  testid?: string;
}
export const CenterLayout: React.FC<Props> = ({ children, testid }) => {
  return (
    <Container data-testid={testid}>
      <Content>{children}</Content>
    </Container>
  );
};
