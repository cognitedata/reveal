import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components/macro';
import { ToastContainer } from '@cognite/cogs.js';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { getProject } from '@cognite/cdf-utilities';
import { queryClient } from './queryClient';

import Routes from './Routes';

function App() {
  const project = getProject();
  // replace path after checking firebase deployment is working
  const basename = `${project}/explore/industryCanvas`;

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <AppWrapper>
        <Router basename={basename} window={window} children={<Routes />} />
      </AppWrapper>
    </QueryClientProvider>
  );
}

export default App;

const AppWrapper = styled.div`
  height: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
`;
