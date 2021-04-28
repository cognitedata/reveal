import React, { useEffect } from 'react';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { setupMixpanel } from 'src/utils/config';
import { Routes } from 'src/Routes';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import GlobalStyles from 'src/styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import AntStyles from 'src/styles/AntStyles';
import theme from 'src/styles/theme';
import { Loader } from '@cognite/cogs.js';
import { ThemeProvider } from 'styled-components';
import { SDKProvider } from '@cognite/sdk-provider';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { Provider as ReduxProvider } from 'react-redux';
import store from 'src/store';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';
import rootStyles from './styles/index.css';

setupMixpanel();

const App = () => {
  const subAppName = 'cdf-vision-subapp';
  const history = createBrowserHistory();
  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    datePickerStyle.use(); // Needed to render date filer correctly

    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      datePickerStyle.unuse();
    };
  }, []);
  return (
    <AntStyles>
      <AuthWrapper
        subAppName={subAppName}
        showLoader
        includeGroups
        loadingScreen={<Loader />}
      >
        <ThemeProvider theme={theme}>
          <SDKProvider sdk={sdkv3}>
            <ReduxProvider store={store}>
              <SubAppWrapper padding={false}>
                <Router history={history}>
                  <Routes />
                </Router>
              </SubAppWrapper>
            </ReduxProvider>
          </SDKProvider>
        </ThemeProvider>
        <GlobalStyles theme={theme} />
      </AuthWrapper>
    </AntStyles>
  );
};

export default App;
