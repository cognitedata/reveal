import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { setupMixpanel } from '@functions-ui/utils/Metrics';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import { getProject, isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';

import RootApp from './containers/RootApp';
import { queryClient } from './queryClient';

setupMixpanel();

function App() {
  const project = getProject();
  const baseUrl = isUsingUnifiedSignin() ? `/cdf/${project}` : `/${project}}`;

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <StyledWrapper>
        <FlagProvider
          apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
          appName="functions-ui"
          projectName={getProject()}
          remoteAddress={window.location.hostname}
          disableMetrics
        >
          <BrowserRouter>
            <Routes>
              <Route path={`${baseUrl}/*`} element={<RootApp />} />
            </Routes>
          </BrowserRouter>
        </FlagProvider>
      </StyledWrapper>
    </QueryClientProvider>
  );
}

export default App;

const StyledWrapper = styled.div``;
