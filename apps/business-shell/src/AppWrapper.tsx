import '@cognite/cogs.js/dist/cogs.css';
import { AuthProvider } from '@cognite/auth-react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import App from './app/App';
import { translations } from './common';
import { AuthProvider as InternalAuthProvider } from './common/auth/AuthProvider';
import GlobalStyles from './GlobalStyles';
import GlobalStyle from './utils/globalStyles';

export const AppWrapper = () => {
  const projectName = 'flexible-data-explorer';

  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <AuthProvider>
          <InternalAuthProvider>
            <App />
          </InternalAuthProvider>
        </AuthProvider>
      </I18nWrapper>
      <GlobalStyle />
    </GlobalStyles>
  );
};
