import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { makeDecorator, WrapperSettings } from '@storybook/addons';
import { QueryClient, QueryClientProvider } from 'react-query';

import styled from 'styled-components';
import { RecoilRoot } from 'recoil';
import { DataExplorationProvider } from '../../../context';

type DataExplorationProviderParameters = {
  mockCdfClient?: Partial<CogniteClient>;
};

type ExplorerWrapperSettings = {
  parameters: DataExplorationProviderParameters;
} & WrapperSettings;

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
