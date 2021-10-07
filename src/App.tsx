import React from "react";
import styled from "styled-components/macro";
import "./AppGlobalStyles.tsx";
import { GlobalStyle } from "./AppGlobalStyles";
import "@cognite/cogs.js/dist/cogs.css";
import { Header } from "./components/Header/Header";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { SolutionsPage } from "./pages/solutions/SolutionsPage";
import { GuideToolsPage } from "./pages/guide&tools/GuideToolsPage";
import { StatusPage } from "./pages/statusboard/StatusboardPage";

function App() {
  return (
    <>
      <GlobalStyle />
      <StyledWrapper>
        <Router>
          <Header />
          <StyledPage>
            <Switch>
              <Route exact path="/">
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
  );
}

export default App;

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100vh;
`;

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
`;
