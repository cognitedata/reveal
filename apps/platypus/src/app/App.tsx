import { BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components/macro';
import { ToastContainer } from '@cognite/cogs.js';
import { ContainerProvider } from 'brandi-react';
import { rootInjector } from './di';

import Routes from './Routes';
import { getTenant } from './utils/tenant-utils';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './queryClient';

// Globally defined global
// GraphiQL package needs this to be run correctly
(window as any).global = window;

function App() {
  const tenant = getTenant();
  return (
    <QueryClientProvider client={queryClient}>
      <ContainerProvider container={rootInjector}>
        <ToastContainer />
        <StyledWrapper>
          <Router basename={tenant}>
            <StyledPage>
              <Routes />
            </StyledPage>
          </Router>
        </StyledWrapper>
      </ContainerProvider>
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
