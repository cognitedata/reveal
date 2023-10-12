import { Route, Routes, BrowserRouter } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { AdvancedJoinsPage } from './pages/AdvancedJoinsPage';
import { queryClient } from './queryClient';
import AntStyles from './styles/Styles';

function App() {
  const project = getProject();
  const baseUrl = `/${project}`;
  return (
    <AntStyles>
      <SDKProvider sdk={sdk}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer />
          <StyledPage>
            <BrowserRouter>
              <Routes>
                <Route path={`${baseUrl}/*`} element={<AdvancedJoinsPage />} />
              </Routes>
            </BrowserRouter>
          </StyledPage>
        </QueryClientProvider>
      </SDKProvider>
    </AntStyles>
  );
}

export default App;

const StyledPage = styled.div`
  height: calc(100vh - var(--cdf-ui-navigation-height));
  overflow-y: auto;
  position: relative;
`;
