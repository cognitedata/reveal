import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  QueryClientProvider as TanstackProvider,
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { queryClient } from './queryClient';
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
