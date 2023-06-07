import { ErrorBoundary } from 'react-error-boundary';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AppContextProvider } from '@data-exploration-components/context/AppContext';
import ExplorerRoutes from '@flexible-data-explorer/app/Routes';
import { IndustryCanvasPage } from '@fusion/industry-canvas';
import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Button, ToastContainer } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { useAuthContext } from '../common/auth/AuthProvider';
import { TopBar } from '../common/topbar/top-bar';

import { queryClient } from './queryClient';

function App() {
  const { client } = useAuthContext();

  return (
    <SDKProvider sdk={client}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ToastContainer />
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary }) => (
                <div>
                  There was an error!
                  <Button onClick={() => resetErrorBoundary()}>
                    Try again
                  </Button>
                </div>
              )}
            >
              <AppContextProvider
                flow="AZURE_AD"
                userInfo={<div />}
                isAdvancedFiltersEnabled
              >
                <Router window={window}>
                  <TopBar />
                  <Routes>
                    <>
                      <Route path="/explore/*" element={<ExplorerRoutes />} />
                      <Route
                        path="/canvas/*"
                        element={<IndustryCanvasPage />}
                      />
                    </>
                  </Routes>
                </Router>
              </AppContextProvider>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    </SDKProvider>
  );
}

export default App;
