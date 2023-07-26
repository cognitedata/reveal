import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ContainerProvider } from 'brandi-react';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';

import { FeatureFlagProvider } from '../environments/FeatureFlagProvider';
import { SubAppContainer } from '../environments/fusion/SubAppContainer';

import NoAccessWrapper from './components/NoAccessPage/NoAccessWrapper';
import { rootInjector } from './di';
import { queryClient } from './queryClient';
import Routes from './Routes';

function App() {
  return (
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
