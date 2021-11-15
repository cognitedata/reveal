import { Container } from '@cognite/react-container';
import { BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components/macro';
import { GlobalStyle } from './AppGlobalStyles';
import { AuthContainer } from './AuthContainer';
import Routes from './Routes';
import sidecar from './utils/sidecar';
import store from './redux/store';

function App() {
  return (
    <Container sidecar={sidecar} store={store}>
      <AuthContainer>
        <GlobalStyle />
        <StyledWrapper>
          <Router basename="platypus">
            <StyledPage>
              <Routes />
            </StyledPage>
          </Router>
        </StyledWrapper>
      </AuthContainer>
    </Container>
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
