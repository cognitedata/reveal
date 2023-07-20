import '@cognite/cogs.js/dist/cogs.css';
import { AuthProvider } from '@cognite/auth-react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { Loader } from '@cognite/cogs.js';

import App from './app/App';
import { AuthProvider as InternalAuthProvider } from './app/common/auth/AuthProvider';
import GlobalStyle from './app/utils/globalStyles';
import GlobalStyles from './GlobalStyles';
import { translations } from './i18n';

export const AppWrapper = () => {
  const projectName = 'flexible-data-explorer';

  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <AuthProvider loader={<Loader infoText="Loading" />}>
          <InternalAuthProvider>
            <App />
          </InternalAuthProvider>
        </AuthProvider>
      </I18nWrapper>
      <GlobalStyle />
    </GlobalStyles>
  );
};
