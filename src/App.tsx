import React from 'react';
import GlobalStyles from 'global-styles';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Trans } from 'react-i18next';
import Home from 'pages/Home';
import { Button } from '@cognite/cogs.js';
import Configurations from 'pages/Configurations';
import Translations from 'pages/Translations';
import Status from 'pages/Status';
import {
  Content,
  Header,
  Layout,
  Main,
  MainMenu,
  MenuLink,
  Title,
} from './elements';

const App = () => {
  return (
    <>
      <GlobalStyles />
      <Router basename="/cwp">
        <Layout>
          <Main>
            <Header>
              <Title>
                <h1>
                  <Trans i18nKey="Global:MainTitle" />
                </h1>
                <Button type="primary" size="large" icon="Plus">
                  <Trans i18nKey="Global:BtnNewConfiguration" />
                </Button>
              </Title>
              <MainMenu>
                <ul>
                  <li>
                    <MenuLink to="/configurations">
                      <Trans i18nKey="Global:MnuConfigurations" />
                    </MenuLink>
                  </li>
                  <li>
                    <MenuLink to="/translations">
                      <Trans i18nKey="Global:MnuTranslations" />
                    </MenuLink>
                  </li>
                  <li>
                    <MenuLink to="/status">
                      <Trans i18nKey="Global:MnuStatus" />
                    </MenuLink>
                  </li>
                </ul>
              </MainMenu>
            </Header>
            <Content>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route path="/configurations">
                  <Configurations />
                </Route>
                <Route path="/translations">
                  <Translations />
                </Route>
                <Route path="/status">
                  <Status />
                </Route>
              </Switch>
            </Content>
          </Main>
        </Layout>
      </Router>
    </>
  );
};

export default App;
