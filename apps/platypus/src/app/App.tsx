import styled from 'styled-components/macro';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import '@cognite/cogs.js/dist/cogs.css';
import { SolutionsPage } from './pages/solutions/SolutionsPage';
import { GuideToolsPage } from './pages/guide&tools/GuideToolsPage';
import { StatusPage } from './pages/statusboard/StatusboardPage';
import { GlobalStyle } from './AppGlobalStyles';
import { Container } from '@cognite/react-container';
import sidecar from './utils/sidecar';

function App() {
  return (
    <Container sidecar={sidecar}>
      <>
        <GlobalStyle />
        <StyledWrapper>
          <Router basename="platypus">
            <StyledPage>
              <Switch>
                <Route
                  exact
                  path={[
                    '/',
                    '/solutions/:solutionId?/:tabKey?/:solutionPage?',
                  ]}
                >
                  <SolutionsPage />
                </Route>
                <Route exact path="/guidetools">
                  <GuideToolsPage />
                </Route>
                <Route exact path="/statusboard">
                  <StatusPage />
                </Route>
              </Switch>
            </StyledPage>
          </Router>
        </StyledWrapper>
      </>
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
