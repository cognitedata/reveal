import { Container } from '@cognite/react-container';
import { BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components/macro';
import { GlobalStyle } from './AppGlobalStyles';
import { AuthContainer } from './AuthContainer';
import { ToastContainer } from '@cognite/cogs.js';

import Routes from './Routes';
import sidecar from './utils/sidecar';
import store from './redux/store';
import { environment } from '../environments/environment';
import { ConditionalReduxProvider } from './utils/ReactContainerMock';
import { AuthContainerMock } from './AuthContainerMock';

// Globally defined global
// GraphiQL package needs this to be run correctly
(window as any).global = window;

function App() {
  const ContainerComponent =
    environment.APP_ENV === 'mock' ? ConditionalReduxProvider : Container;

  const AuthContainerComponent =
    environment.APP_ENV === 'mock' ? AuthContainerMock : AuthContainer;
  return (
    <>
      <ToastContainer />
      <ContainerComponent sidecar={sidecar} store={store}>
        <AuthContainerComponent>
          <GlobalStyle />
          <StyledWrapper>
            <Router basename="platypus">
              <StyledPage>
                <Routes />
              </StyledPage>
            </Router>
          </StyledWrapper>
        </AuthContainerComponent>
      </ContainerComponent>
    </>
  );
}

export default App;

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100vh;
  overflow: hidden;
`;

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;
