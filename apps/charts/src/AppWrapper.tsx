import { translations } from '@charts-app/common/i18n';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';

import { RootApp } from './App';
import './set-public-path';

export const AppWrapper = () => {
  const projectName = 'charts';
  const project = getProject();
  const env = getEnv();

  return (
    <I18nWrapper translations={translations} defaultNamespace={projectName}>
      <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
        <SubAppWrapper title={projectName}>
          <RootApp />
        </SubAppWrapper>
      </AuthWrapper>
    </I18nWrapper>
  );
};
