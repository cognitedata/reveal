import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';

import { HomePage } from './pages/HomePage';
import { queryClient } from './queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <StyledWrapper>
        <StyledPage>
          <HomePage />
        </StyledPage>
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

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;
