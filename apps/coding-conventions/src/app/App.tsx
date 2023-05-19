import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components/macro';
import { ToastContainer } from '@cognite/cogs.js';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider as TanstackProvider } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClient } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';

import Routes from './Routes';
import { Database } from './service/storage/Database';

function App() {
  const project = getProject();
  const basename = `${project}/coding-conventions`;

  useEffect(() => {
    Database.init();
  }, []);

  const queryClientNormal = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  return (
    <SDKProvider sdk={sdk}>
      <TanstackProvider client={queryClient}>
        <QueryClientProvider client={queryClientNormal}>
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
        </QueryClientProvider>
      </TanstackProvider>
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
