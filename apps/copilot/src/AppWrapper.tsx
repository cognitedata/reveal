import { useEffect } from 'react';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, getProject } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { FlagProvider } from '@cognite/react-feature-flags';

import './set-public-path';

import App from './app/App';
import { translations } from './app/common';
import GlobalStyles from './GlobalStyles';

export const AppWrapper = () => {
  const projectName = 'copilot';
  const project = getProject();

  useEffect(() => {
    cogsStyles.use();
    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="copilot"
      projectName={project}
      remoteAddress={window.location.hostname}
      disableMetrics
    >
      <GlobalStyles>
        <I18nWrapper translations={translations} defaultNamespace={projectName}>
          <AuthWrapper login={() => loginAndAuthIfNeeded()}>
            <App />
          </AuthWrapper>
        </I18nWrapper>
      </GlobalStyles>
    </FlagProvider>
  );
};
