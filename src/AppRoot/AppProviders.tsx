import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createClient } from 'utils';
import { TenantProvider } from 'providers/TenantProvider';
import { I18nContainer } from '@cognite/react-i18n';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import GlobalStyles from 'global-styles';
import { Provider as ReduxProvider } from 'react-redux';
import store from 'store';

type Props = {
  children?: React.ReactNode;
  tenant: string;
};

const cdfClient = createClient();

const AppProviders: React.FC<Props> = ({
  children,
  tenant,
}: Props): JSX.Element => {
  return (
    <ReduxProvider store={store}>
      <CdfClientProvider client={cdfClient}>
        <TenantProvider tenant={tenant}>
          <I18nContainer>
            <GlobalStyles />
            <Router>{children}</Router>
          </I18nContainer>
        </TenantProvider>
      </CdfClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
