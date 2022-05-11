import React from 'react';
import styled from 'styled-components';
import { CdfCount } from './CdfCount';

const sdkMock = {
  post: async () => ({ data: { items: [{ count: 100 }] } }),
};

export default {
  title: 'Component/Uses Context/CdfCount',
  component: CdfCount,
  parameters: {
    explorerConfig: { sdkMockOverride: sdkMock },
  },
};

export const Example = () => (
  <Container>
    <CdfCount type="assets" />
  </Container>
);

const Container = styled.div`
  padding: 20px;
  display: flex;
`;
