import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ContainerProvider } from 'brandi-react';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { getCogniteSDKClient } from '../environments/cogniteSdk';
import { FeatureFlagProvider } from '../environments/FeatureFlagProvider';

import NoAccessWrapper from './components/NoAccessPage/NoAccessWrapper';
import { rootInjector } from './di';
import { queryClient } from './queryClient';
import Routes from './Routes';
import { SubAppContainer } from './SubAppContainer';

function App() {
  return (
    <SDKProvider sdk={getCogniteSDKClient()}>
      <FeatureFlagProvider>
        <QueryClientProvider client={queryClient}>
          <SubAppContainer>
            <ReactQueryDevtools initialIsOpen={false} />
            <ContainerProvider container={rootInjector}>
              <ToastContainer />
              <StyledWrapper>
                <NoAccessWrapper>
                  <StyledPage>
                    <Routes />
                  </StyledPage>
                </NoAccessWrapper>
              </StyledWrapper>
            </ContainerProvider>
          </SubAppContainer>
        </QueryClientProvider>
      </FeatureFlagProvider>
    </SDKProvider>
  );
}

export default App;

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow: hidden;
`;

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;
