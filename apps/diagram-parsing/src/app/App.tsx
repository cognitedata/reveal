import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import { getProject } from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';

import { queryClient } from './queryClient';
import Routes from './Routes';

function App() {
  const project = getProject();
  const basename = `${project}/diagram-parsing`;

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <Suspense fallback={<Loader />}>
        <SCWrapper>
          <Router
            basename={basename}
            window={window}
            children={
              <SCPage>
                <Routes />
              </SCPage>
            }
          />
        </SCWrapper>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;

const SCWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow: hidden;
`;

const SCPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;
