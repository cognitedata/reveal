import { useEffect } from 'react';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import './set-public-path';

import App from './app/App';
import { translations } from './app/common';
import GlobalStyles from './GlobalStyles';

export const AppWrapper = () => {
  const projectName = 'functions-ui';
  const project = getProject();
  const env = getEnv();

  useEffect(() => {
    cogsStyles.use();
    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
          <SubAppWrapper title="Functions UI">
            <App />
          </SubAppWrapper>
        </AuthWrapper>
      </I18nWrapper>
    </GlobalStyles>
  );
};
