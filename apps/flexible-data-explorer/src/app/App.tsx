import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Button, ToastContainer } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { useAuthContext } from './common/auth/AuthProvider';
import { TopBar } from './common/topbar/top-bar';
import { queryClient } from './queryClient';
import Routes from './Routes';

function App() {
  const { client } = useAuthContext();

  return (
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
                <div>
                  There was an error!
                  <Button onClick={() => resetErrorBoundary()}>
                    Try again!
                  </Button>
                </div>
              )}
            >
              <Router window={window} children={<Routes />} />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
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
