import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';

import { CopilotPage } from './pages/CopilotPage';
import { queryClient } from './queryClient';
import './utils/setupMonaco';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <StyledWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/:tenant/*" element={<CopilotPage />} />
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
