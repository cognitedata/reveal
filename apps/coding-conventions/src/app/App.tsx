import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer, getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';

import Routes from './Routes';

function App() {
  const project = getProject();
  const basename = `${project}/coding-conventions`;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContainer
        title="coding-conventions"
        sdk={sdk}
        login={loginAndAuthIfNeeded}
      >
        <ReactQueryDevtools initialIsOpen={false} />
        <ToastContainer />
        <StyledWrapper>
          <Router
            basename={basename}
            window={window}
            children={
              <StyledPage>
                <Routes />
              </StyledPage>
            }
          />
        </StyledWrapper>
      </AuthContainer>
    </QueryClientProvider>
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
