import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import collapseStyle from 'rc-collapse/assets/index.css';

import { getEnv, getProject } from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import { AppEnvProvider } from './hooks/useAppEnv';
import CreateExtpipe from './pages/create/CreateExtpipe';
import ExtpipePage from './pages/Extpipe/ExtpipePage';
import Extpipes from './pages/Extpipes/Extpipes';
import { HostedExtractionPipelineDetails } from './pages/hosted-extraction-pipeline/HostedExtractionPipelineDetails';
import AppScopeStyles from './styles';
import antdTheme from './styles/antd-theme.less';
import GlobalStyles from './styles/GlobalStyles';
import rootStyles from './styles/index.css';
import theme from './styles/theme';

const App = () => {
  const projectName = getProject();
  const env = getEnv();
  const { origin } = window.location;

  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    collapseStyle.use();
    antdTheme.use();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      collapseStyle.unuse();
      antdTheme.unuse();
    };
  }, []);

  return (
    <AppScopeStyles>
      <ThemeProvider theme={theme}>
        <AppEnvProvider cdfEnv={env} project={projectName} origin={origin}>
          <Suspense fallback={<Loader />}>
            <ToastContainer />
            <Routes>
              <Route path="/create" element={<CreateExtpipe />} />
              <Route path="/extpipe/:id*" element={<ExtpipePage />} />
              <Route
                path="/hosted-extraction-pipeline/:externalId"
                element={<HostedExtractionPipelineDetails />}
              />
              <Route path="/" element={<Extpipes />} />
            </Routes>
          </Suspense>
        </AppEnvProvider>
      </ThemeProvider>
      <GlobalStyles theme={theme} />
    </AppScopeStyles>
  );
};

export default App;
