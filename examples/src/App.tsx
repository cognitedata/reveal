/*
 * Copyright 2021 Cognite AS
 */

import styled from 'styled-components';
import { Migration } from './pages/Migration';

const PageContainer = styled.div`
  box-shadow: rgba(0, 0, 0, 0.1) 0 1px 5px 0;
  background: rgb(255, 255, 255);
  padding: 15px;
  border-radius: 4px;
  min-height: 95vh;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;

export default function App(): JSX.Element {
  return <PageContainer><Migration key="/" /></PageContainer>;
}
