import { useEffect } from 'react';

import { translations } from '@charts-app/common/i18n';
import GlobalStyles from '@charts-app/styles/GlobalStyles';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import './set-public-path';
import { RootApp } from './App';

export const AppWrapper = () => {
  const projectName = 'charts';
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
            <RootApp />
          </SubAppWrapper>
        </AuthWrapper>
      </I18nWrapper>
    </GlobalStyles>
  );
};
