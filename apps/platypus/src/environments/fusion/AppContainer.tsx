import { Provider as ReduxProvider } from 'react-redux';

import { translations } from '@platypus-app/common';
import GlobalStyles from '@platypus-app/GlobalStyles';
import { Store } from 'redux';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';

import '../../set-public-path';

type AppContainerProps = {
  store: Store;
  children: React.ReactNode;
};
export const AppContainer = ({ children, store }: AppContainerProps) => {
  const project = getProject();
  const env = getEnv();

  return (
    <I18nWrapper translations={translations} defaultNamespace="platypus">
      <ReduxProvider store={store}>
        <GlobalStyles>
          <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
            <SubAppWrapper title="Data Models">{children}</SubAppWrapper>
          </AuthWrapper>
        </GlobalStyles>
      </ReduxProvider>
    </I18nWrapper>
  );
};
