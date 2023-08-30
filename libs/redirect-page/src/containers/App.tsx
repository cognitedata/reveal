import { useState } from 'react';

import {
  I18nWrapper,
  getLanguage,
  selectLanguage,
} from '@cognite/cdf-i18n-utils';
import { handleSigninCallback } from '@cognite/login-utils';
import { FlagProvider } from '@cognite/react-feature-flags';

import { translations } from '../common/i18n';
import { Background } from '../Components';
import GlobalStyles from '../styles/GlobalStyles';

import { HelpModal } from './HelpModal';
import { Login } from './Login';

import '../styles/index.css';

export default function App(): JSX.Element {
  const [isHelpModalVisible, setIsHelpModalVisible] = useState<boolean>(false);
  const appName = 'cdf-redirect-page';
  const language = getLanguage();

  const languageSwitchHandler = (newLang: string) => {
    if (newLang && newLang !== language) {
      selectLanguage(newLang);
      window.history.replaceState(null, '', `?lang=${newLang}`);
      window.location.reload();
    }
  };

  if (window.location.pathname === '/signin/callback') {
    try {
      handleSigninCallback();
      return <p>Redirecting...</p>;
    } catch (err) {
      console.error(err);
      // ignrore error and instead render the redirect page as normal
      window.history.replaceState(null, '', '/');
    }
  }

  return (
    <I18nWrapper translations={translations} defaultNamespace="redirect-page">
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName={appName}
        projectName={appName}
      >
        <GlobalStyles>
          <Background
            language={language}
            toggleLanguage={languageSwitchHandler}
          >
            <HelpModal
              visible={isHelpModalVisible}
              setVisible={setIsHelpModalVisible}
            />
            <Login setIsHelpModalVisible={setIsHelpModalVisible} />
          </Background>
        </GlobalStyles>
      </FlagProvider>
    </I18nWrapper>
  );
}
