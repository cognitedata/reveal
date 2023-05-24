import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import './set-public-path';
import { useEffect } from 'react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import App from './app/App';
import GlobalStyles from './GlobalStyles';

import { translations } from './app/common/i18n';
import GlobalStyle from './app/utils/globalStyles';

export const AppWrapper = () => {
  const projectName = 'flexible-data-explorer';
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
          <SubAppWrapper title={projectName}>
            <App />
          </SubAppWrapper>
        </AuthWrapper>
      </I18nWrapper>
      <GlobalStyle />
    </GlobalStyles>
  );
};
