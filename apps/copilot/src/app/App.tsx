import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import { getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';

import { CopilotPage } from './pages/CopilotPage';
import { queryClient } from './queryClient';
import './utils/setupMonaco';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <StyledWrapper>
        <FlagProvider
          apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
          appName="copilot"
          projectName={getProject()}
          remoteAddress={window.location.hostname}
          disableMetrics
        >
          <BrowserRouter>
            <Routes>
              <Route path="/:tenant/*" element={<CopilotPage />} />
            </Routes>
          </BrowserRouter>
        </FlagProvider>
      </StyledWrapper>
    </QueryClientProvider>
  );
}

export default App;

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow: hidden;
`;
