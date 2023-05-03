/*
 * Copyright 2021 Cognite AS
 */

import styled from 'styled-components';
import { Viewer } from './pages/Viewer';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  overflow-x: auto;
`;

export default function App(): JSX.Element {
  return (
    <PageContainer>
      <Viewer key="/" />
    </PageContainer>
  );
}
