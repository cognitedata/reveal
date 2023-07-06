import React from 'react';

import styled from 'styled-components';

import { makeDecorator } from '@storybook/addons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';

import { CogniteClient } from '@cognite/sdk';

import { DataExplorationProvider } from '../../../context';

type DataExplorationProviderParameters = {
  sdkMockOverride?: Partial<CogniteClient>;
};

type ExplorerWrapperSettings = {
  parameters: DataExplorationProviderParameters;
};

const queryClient = new QueryClient();

export default makeDecorator({
  name: 'withExplorerConfig',
  parameterName: 'explorerConfig',
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters }: ExplorerWrapperSettings) => {
    const { sdkMockOverride = {} } = parameters || {};
    const mockCDFClient = { ...sdkMockOverride };

    return (
      <Container>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore*/}
        <DataExplorationProvider sdk={mockCDFClient}>
          <QueryClientProvider client={queryClient}>
            <RecoilRoot>{storyFn(context) as React.ReactNode}</RecoilRoot>
          </QueryClientProvider>
        </DataExplorationProvider>
      </Container>
    );
  },
});

export const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100%;
`;
