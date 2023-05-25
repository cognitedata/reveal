import '@cognite/cogs.js/dist/cogs.css';
import { AuthProvider } from '@cognite/auth-react';
import { AuthProvider as InternalAuthProvider } from './app/common/auth/AuthProvider';
import './set-public-path';
import { useEffect } from 'react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import App from './app/App';
import GlobalStyles from './GlobalStyles';

import { translations } from './app/common/i18n';
import GlobalStyle from './app/utils/globalStyles';

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
