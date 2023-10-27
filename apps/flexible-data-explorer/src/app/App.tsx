import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import styled from 'styled-components';

import { useAuthContext } from '@fdx/shared/common/auth/AuthProvider';
import { TopBar } from '@fdx/shared/common/topbar/top-bar';
import zIndex from '@fdx/shared/utils/zIndex';
import { Copilot } from '@fusion/copilot-core';
import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Button, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { queryClient } from './queryClient';
import Routes from './Routes';

function App() {
  const { client } = useAuthContext();

  return (
    <FlagProvider
      appName="business-portal"
      projectName={`${client.project}`}
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      remoteAddress={window.location.hostname}
    >
      <SDKProvider sdk={client}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer />
          <TopBar />
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary }) => (
                  <center>
                    There was an error!
                    <Button
                      onClick={() => {
                        resetErrorBoundary();
                      }}
                    >
                      Try again!
                    </Button>
                  </center>
                )}
              >
                <Router window={window} children={<Routes />} />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </QueryClientProvider>
      </SDKProvider>
      <CopilotWrapper>
        <Copilot sdk={client} />
      </CopilotWrapper>
    </FlagProvider>
  );
}

export default App;

const CopilotWrapper = styled.div`
  z-index: ${zIndex.COPILOT};
  position: absolute;
  display: none;
`;

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
