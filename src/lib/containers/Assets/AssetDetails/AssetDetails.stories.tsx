import React from 'react';
import styled from 'styled-components';
import { SDKProvider } from 'lib/context';
import { assets } from 'stubs/assets';
import { AssetDetails } from './AssetDetails';

export default {
  title: 'Assets/AssetDetails',
  component: AssetDetails,
  decorators: [
    (storyFn: any) => (
      <Container>
        <SDKProvider sdk={sdkMock}>{storyFn()}</SDKProvider>
      </Container>
    ),
  ],
};
const sdkMock = {
  post: async () => ({ data: { items: assets } }),
};
export const Example = () => <AssetDetails id={1} />;

const Container = styled.div`
  padding: 20px;
  display: flex;
`;
