import { makeDecorator } from '@storybook/addons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ToastContainer } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';

import { DataExplorationProvider } from '../src';
import { Container, sdkMock } from '../src/docs/stub';

type DataExplorationProviderParameters = {
  sdkMockOverride?: Partial<CogniteClient>;
};

type ExplorerWrapperSettings = {
  parameters: DataExplorationProviderParameters;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default makeDecorator({
  name: 'withExplorerConfig',
  parameterName: 'explorerConfig',
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters }: ExplorerWrapperSettings) => {
    const { sdkMockOverride = {} } = parameters || {};
    const mockCDFClient = { ...sdkMock, ...sdkMockOverride };

    return (
      <Container>
        <DataExplorationProvider
          // @ts-ignore
          sdk={mockCDFClient}
          flow="UNKNOWN"
          userInfo={{}}
        >
          {/* Added toast container to show toast in storybook */}
          <ToastContainer />
          <QueryClientProvider client={queryClient}>
            {/*@ts-ignore*/}
            {storyFn(context)}
          </QueryClientProvider>
        </DataExplorationProvider>
      </Container>
    );
  },
});
