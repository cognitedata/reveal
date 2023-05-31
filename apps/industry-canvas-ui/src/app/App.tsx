import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

// import { getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';

import { queryClient } from './queryClient';
// import Routes from './Routes'; // This import doesn't work @Luis needs to take a look

function App() {
  // const project = getProject();
  // replace path after checking firebase deployment is working
  // const basename = `${project}/explore/industryCanvas`;

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <AppWrapper>
        {/*<Router basename={basename} window={window} children={<Routes />} />*/}
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
