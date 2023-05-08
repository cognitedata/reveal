import React from 'react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import { ToastContainer } from '@cognite/cogs.js';
import sdk from '@cognite/cdf-sdk-singleton';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { getProject } from '@cognite/cdf-utilities';
import { queryClient } from './queryClient';

import Routes from './Routes';
import { SDKProvider } from '@cognite/sdk-provider';

function App() {
  const project = getProject();
  const basename = `${project}/explore`;
  const params = useParams();
  console.log(params);

  return (
    <SDKProvider sdk={sdk}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ToastContainer />
        <Router basename={basename} window={window} children={<Routes />} />
      </QueryClientProvider>
    </SDKProvider>
  );
}

export default App;

// Leaving these stylings for now, will remove later...
// const StyledWrapper = styled.div`
//   display: flex;
//   flex-flow: column;
//   height: 100%;
//   min-height: 100vh;
//   flex: 1;
//   background-color: var(--default-bg-color);
// `;

// const StyledPage = styled.div`
//   display: flex;
//   flex: 1;
//   flex-direction: column;
//   overflow: auto;
// `;
