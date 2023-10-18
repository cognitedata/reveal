import { Provider as ReduxProvider } from 'react-redux';

import { Store } from 'redux';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import { translations } from '../../i18n';

import { AuthContainer } from './AuthContainer';

type AppContainerProps = {
  store: Store;
  children: React.ReactNode;
};
export const AppContainer = ({ children, store }: AppContainerProps) => {
  return (
    <I18nWrapper translations={translations} defaultNamespace="platypus">
      <ReduxProvider store={store}>
        {/* <GlobalStyles> */}
        <AuthContainer>{children}</AuthContainer>
        {/* </GlobalStyles> */}
      </ReduxProvider>
    </I18nWrapper>
  );
};
