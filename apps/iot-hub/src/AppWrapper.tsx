import { useEffect } from 'react';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { SubAppWrapper, AuthWrapper } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import './set-public-path';
import App from './app/App';
import { translations } from './app/common/i18n';
import { IoTProvider } from './app/context/IoTHubContext';
import GlobalStyles from './GlobalStyles';

export const AppWrapper = () => {
  const projectName = 'iot-hub';

  useEffect(() => {
    cogsStyles.use();
    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <AuthWrapper login={() => loginAndAuthIfNeeded()}>
          <SubAppWrapper title={projectName}>
            <IoTProvider>
              <App />
            </IoTProvider>
          </SubAppWrapper>
        </AuthWrapper>
      </I18nWrapper>
    </GlobalStyles>
  );
};
