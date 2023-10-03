import '@cognite/cogs.js/dist/cogs.css';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import App from './app/App';
import { AuthProvider as InternalAuthProvider } from './app/common/auth/AuthProvider';
import GlobalStyle from './app/utils/globalStyles';
import GlobalStyles from './GlobalStyles';
import { translations } from './i18n';

const projectName = 'flexible-data-explorer';

export const AppWrapper = () => {
  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <InternalAuthProvider>
          <App />
        </InternalAuthProvider>
      </I18nWrapper>
      <GlobalStyle />
    </GlobalStyles>
  );
};
