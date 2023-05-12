/*
 * Copyright 2021 Cognite AS
 */

import styled from 'styled-components';
import { Viewer } from './pages/Viewer';
import { Button } from '@cognite/reveal-react-components';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  overflow-x: auto;
`;

export default function App(): JSX.Element {
  return (
    <PageContainer>
      <Button />
      <Viewer key="/" />
    </PageContainer>
  );
}
