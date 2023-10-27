import '@cognite/cogs.js/dist/cogs.css';
import { AuthProvider as InternalAuthProvider } from '@fdx/shared/common/auth/AuthProvider';
import { translations } from '@fdx/shared/common/i18n';
import GlobalStyle from '@fdx/shared/utils/globalStyles';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import App from './app/App';
import GlobalStyles from './GlobalStyles';

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
