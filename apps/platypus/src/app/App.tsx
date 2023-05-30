import { BrowserRouter as Router } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ContainerProvider } from 'brandi-react';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';

import { FeatureFlagProvider } from '../environments/FeatureFlagProvider';

import NoAccessWrapper from './components/NoAccessPage/NoAccessWrapper';
import { rootInjector } from './di';
import { queryClient } from './queryClient';
import Routes from './Routes';
import { getTenant, isUsingUnifiedSignin } from './utils/tenant-utils';

// Globally defined global
// GraphiQL package needs this to be run correctly
(window as any).global = window;

function App() {
  const tenant = isUsingUnifiedSignin() ? `/cdf/${getTenant()}` : getTenant();

  return (
    <FeatureFlagProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ContainerProvider container={rootInjector}>
          <ToastContainer />
          <StyledWrapper>
            <NoAccessWrapper>
              <Router
                basename={tenant}
                window={window}
                children={
                  <StyledPage>
                    <Routes />
                  </StyledPage>
                }
              />
            </NoAccessWrapper>
          </StyledWrapper>
        </ContainerProvider>
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
