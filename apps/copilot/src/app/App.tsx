import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Copilot } from '@fusion/copilot-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import sdk from '@cognite/cdf-sdk-singleton';
import { ToastContainer } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { CopilotPage } from './pages/CopilotPage';
import { queryClient } from './queryClient';
import './utils/setupMonaco';

function App() {
  const { isEnabled } = useFlag('COGNITE_COPILOT');
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <StyledWrapper>
        <BrowserRouter>
          <Routes>
            <Route
              path="/:tenant"
              element={
                <Copilot sdk={sdk} showChatButton={isEnabled}>
                  <CopilotPage />
                </Copilot>
              }
            />
          </Routes>
        </BrowserRouter>
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
