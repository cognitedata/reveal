import React from 'react';
import styled from 'styled-components';
import { SDKProvider } from '@cognite/sdk-provider';
import { CdfCount } from './CdfCount';

export default {
  title: 'Component/Uses Context/CdfCount',
  component: CdfCount,
  decorators: [
    (storyFn: any) => (
      <Container>
        <SDKProvider sdk={sdkMock}>{storyFn()}</SDKProvider>
      </Container>
    ),
  ],
};
const sdkMock = {
  post: async () => ({ data: { items: [{ count: 1 }] } }),
};
export const Example = () => <CdfCount type="assets" />;

const Container = styled.div`
  padding: 20px;
  display: flex;
`;
